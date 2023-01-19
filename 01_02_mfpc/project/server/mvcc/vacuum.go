package mvcc

import (
	"context"
	"database/sql"
	"log"
)

func getTables(conn *sql.DB) ([]string, error) {
	rows, err := conn.Query(`
		SELECT
			tablename
		FROM
			pg_catalog.pg_tables
		WHERE
			schemaname != 'pg_catalog'
			AND schemaname != 'information_schema'
			AND tablename != 'schema_migrations';
	`)
	defer rows.Close()
	if err != nil {
		return []string{}, err
	}

	var tables []string
	for rows.Next() {
		var table string
		err = rows.Scan(&table)
		if err != nil {
			return []string{}, err
		}
		tables = append(tables, table)
	}

	return tables, nil
}

// Removes the old, inaccessible versions of the record
func vacuum(ctx context.Context, mvccConn *sql.DB, appConn *sql.DB) (int, error) {
	ctx, stop := context.WithCancel(context.Background())
	defer stop()
	// Fetch all active transactions
	rows, err := mvccConn.QueryContext(ctx, "SELECT * FROM transactions WHERE status = 'active'")
	defer rows.Close()
	if err != nil {
		return 0, err
	}

	var activesTxs []TransactionData
	for rows.Next() {
		var tx TransactionData
		if err := rows.Scan(&tx.ID, &tx.CreatedAt, &tx.Status); err != nil {
			return 0, err
		}
		activesTxs = append(activesTxs, tx)
	}

	tables, err := getTables(appConn)
	if err != nil {
		return 0, err
	}

	// Fetch the rows marked for deletion (inserted but rolled back || deletion commited)
	delCount := 0
	for _, table := range tables {
		rows, err = appConn.QueryContext(ctx, "SELECT tx_min, tx_max, id FROM "+table+" WHERE tx_max != 0 AND tx_max_commited = TRUE OR tx_min_rolled_back = TRUE")
		defer rows.Close()
		if err != nil {
			return 0, err
		}

		for rows.Next() {
			var txMin, txMax, id int
			if err := rows.Scan(&txMin, &txMax, &id); err != nil {
				return 0, err
			}

			canBeDeleted := true
			for _, tx := range activesTxs {
				if tx.ID > txMin && tx.ID < txMax {
					canBeDeleted = false
					break
				}
			}

			if canBeDeleted {
				_, err = appConn.ExecContext(ctx, "DELETE FROM "+table+" WHERE tx_min=$1 AND tx_max=$2 AND id=$3", txMin, txMax, id)
				if err != nil {
					return 0, err
				}
				delCount++
			}
		}
	}

	log.Printf("Vacuumed %d rows\n", delCount)

	return delCount, nil
}
