package mvcc

import (
	"context"
	"database/sql"
	"log"
	"reflect"
	"sync"
)

var mu sync.Mutex

func getTx(ctx context.Context, conn *sql.DB, id int) (*TransactionData, error) {
	row := conn.QueryRowContext(ctx, "SELECT id, created_at, status FROM transactions WHERE id=$1", id)

	t := &TransactionData{}
	err := row.Scan(&t.ID, &t.CreatedAt, &t.Status)
	if err != nil {
		return nil, err
	}

	return t, nil
}

// Open a new database transaction
func OpenTx(ctx context.Context, sqlDb *sql.DB, appSql *sql.DB) (*Transaction, error) {
	// Acquire the mutex to atomically setup the new transaction
	mu.Lock()
	defer mu.Unlock()

	stmt := `INSERT INTO transactions(status) VALUES($1) RETURNING id`

	var id int
	err := sqlDb.QueryRowContext(ctx, stmt, TxActive).Scan(&id)
	if err != nil {
		return nil, err
	}

	txData, err := getTx(ctx, sqlDb, id)
	if err != nil {
		return nil, err
	}

	tx := &Transaction{
		TransactionData: *txData,
		sql:             sqlDb,
		appSql:          appSql,
		ctx:             ctx,
	}

	// TODO: Add the node to the graph

	return tx, nil
}

func (tx *Transaction) isRowVisible(row *RecordBase) bool {
	if row.TxMin > tx.ID || row.TxMaxRolledBack {
		// Row created after the current transaction
		return false
	}

	if row.TxMax < tx.ID && row.TxMaxCommited {
		// Row deleted before the current transaction
		return false
	}

	if row.TxMax == tx.ID {
		// Row deleted by the current transaction.
		// Further operations from the transaction must not see it.
		return false
	}

	// Would there be a reason to read the transaction from the DB
	// and ensure the status was up to date?

	return true
}

// Select chooses the version of the record valid at time of the transaction
// and stores it in the record parameter.
func (tx *Transaction) Select(table string, id int, data ...any) *Transaction {
	rows, err := tx.appSql.QueryContext(tx.ctx, "SELECT * FROM "+table+" WHERE id=$1", id)
	defer rows.Close()
	if err != nil {
		log.Printf("Failed to select rows with id %d from table %s", id, table)
		return nil
	}

	cols, _ := rows.Columns()
	for rows.Next() {
		row := make([]interface{}, len(cols))
		for i := range cols {
			row[i] = new(interface{})
		}
		rows.Scan(row...)
		base := RecordBase{}
		for i, col := range cols {
			sv := reflect.Indirect(reflect.ValueOf(row[i])).Elem()
			switch col {
			case "txid_min":
				base.TxMin = int(sv.Int())
			case "txid_max":
				base.TxMax = int(sv.Int())
			case "tx_max_commited":
				base.TxMaxCommited = sv.Bool()
			case "tx_max_rolled_back":
				base.TxMaxRolledBack = sv.Bool()
			}
		}

		// Look for the visible row. The should be only one
		if tx.isRowVisible(&base) {
			for i := 0; i < len(data); i++ {
				// Skip the MVCC columns (first 4)
				sv := reflect.Indirect(reflect.ValueOf(row[i+4])).Elem()
				dv := reflect.Indirect(reflect.ValueOf(data[i]))
				switch sv.Kind() {
				case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
					dv.SetInt(sv.Int())
				case reflect.String:
					dv.SetString(sv.String())
				}
			}
		}
	}

	return tx
}

func (tx *Transaction) Insert() *Transaction {
	return tx
}

func (tx *Transaction) Update() *Transaction {
	return tx
}

func (tx *Transaction) Delete() *Transaction {
	return tx
}

// Commits the changes performed during the transaction
// so other transactions can see them.
func (tx *Transaction) Commit() error {
	t, err := tx.sql.BeginTx(tx.ctx, nil)
	if err != nil {
		return err
	}

	//
	// for _, op := range tx.operations {

	// }

	return t.Commit()
}
