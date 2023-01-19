package mvcc

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"reflect"
	"strings"
	"sync"

	"golang.org/x/exp/slices"
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
func openTx(ctx context.Context, sqlDb *sql.DB, appSql *sql.DB) (*Transaction, error) {
	// Acquire the mutex to atomically setup the new transaction
	mu.Lock()
	defer mu.Unlock()

	var id int
	stmt := `INSERT INTO transactions(status) VALUES($1) RETURNING id`
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
		mvccConn:        sqlDb,
		appConn:         appSql,
		ctx:             ctx,
	}

	// TODO: Add the node to the graph

	return tx, nil
}

func (tx *Transaction) IsRowVisible(row *RecordBase) bool {
	if row.TxMin > tx.ID || row.TxMinRolledBack {
		// Row created after the current transaction or the insert was rolled back
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

func (tx *Transaction) selectRecord(table string, id int, data ...any) (*RecordBase, error) {
	rows, err := tx.appConn.QueryContext(tx.ctx, "SELECT * FROM "+table+" WHERE id=$1", id)
	defer rows.Close()
	if err != nil {
		return nil, err
	}

	base := &RecordBase{}
	cols, _ := rows.Columns()
	for rows.Next() {
		row := make([]interface{}, len(cols))
		for i := range cols {
			row[i] = new(interface{})
		}
		rows.Scan(row...)
		for i, col := range cols {
			sv := reflect.Indirect(reflect.ValueOf(row[i])).Elem()
			switch col {
			case "tx_min":
				base.TxMin = int(sv.Int())
			case "tx_max":
				base.TxMax = int(sv.Int())
			case "tx_min_commited":
				base.TxMinCommited = sv.Bool()
			case "tx_min_rolled_back":
				base.TxMinRolledBack = sv.Bool()
			case "tx_max_commited":
				base.TxMaxCommited = sv.Bool()
			case "tx_max_rolled_back":
				base.TxMaxRolledBack = sv.Bool()
			}
		}

		// Look for the visible row. There should be only one
		if tx.IsRowVisible(base) {
			for i := 0; i < len(data); i++ {
				// Skip the MVCC columns (first 6)
				sv := reflect.Indirect(reflect.ValueOf(row[i+6])).Elem()
				dv := reflect.Indirect(reflect.ValueOf(data[i]))
				switch sv.Kind() {
				case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
					dv.SetInt(sv.Int())
				case reflect.String:
					dv.SetString(sv.String())
				}
			}
			break
		}
	}

	return base, nil
}

// Select chooses the version of the record valid at time of the transaction
// and stores it in the record parameter.
func (tx *Transaction) Select(table string, id int, data ...any) *Transaction {
	_, err := tx.selectRecord(table, id, data...)
	if err != nil {
		log.Printf("Failed to select rows with id %d from table %s: %v", id, table, err)
		return nil
	}

	return tx
}

func makeRange(min, max int) []string {
	a := make([]string, max-min+1)
	for i := range a {
		a[i] = fmt.Sprintf("$%d", min+i)
	}
	return a
}

func (tx *Transaction) Insert(table string, fields []string, values ...any) (int, error) {
	var id int
	stmt := `INSERT INTO ` + table + ` (`
	f := append([]string{"tx_min"}, fields...)
	stmt += strings.Join(f, ", ")

	stmt += ") VALUES("
	r := makeRange(1, len(values)+1)
	stmt += strings.Join(r, ", ")
	stmt += ") RETURNING id"

	err := tx.appConn.QueryRowContext(tx.ctx, stmt, append([]any{tx.ID}, values...)...).Scan(&id)
	if err != nil {
		return 0, err
	}

	tx.records = append(tx.records, Record{Table: table, ID: id, Operation: OpInsert})

	return id, nil
}

func (tx *Transaction) Update(table string, id int, fields []string, values ...any) error {
	rows, err := tx.appConn.QueryContext(tx.ctx, "SELECT * FROM "+table+" WHERE id=$1", id)
	defer rows.Close()
	if err != nil {
		return err
	}

	base := &RecordBase{}
	cols, _ := rows.Columns()
	row := make([]interface{}, len(cols))
	for i := range cols {
		row[i] = new(interface{})
	}
	for rows.Next() {
		rows.Scan(row...)
		for i, col := range cols {
			sv := reflect.Indirect(reflect.ValueOf(row[i])).Elem()
			switch col {
			case "tx_min":
				base.TxMin = int(sv.Int())
			case "tx_max":
				base.TxMax = int(sv.Int())
			case "tx_min_commited":
				base.TxMinCommited = sv.Bool()
			case "tx_min_rolled_back":
				base.TxMinRolledBack = sv.Bool()
			case "tx_max_commited":
				base.TxMaxCommited = sv.Bool()
			case "tx_max_rolled_back":
				base.TxMaxRolledBack = sv.Bool()
			}
		}

		// Look for the visible row. There should be only one
		if tx.IsRowVisible(base) {
			// Merge the new values into the row
			for i, f := range fields {
				index := slices.Index(cols, f)
				dv := reflect.Indirect(reflect.ValueOf(row[index]))
				dv.Set(reflect.ValueOf(values[i]))
			}
			break
		}
	}

	err = tx.Delete(table, id)
	if err != nil {
		return err
	}

	cols = cols[6:]
	row = row[6:]
	_, err = tx.Insert(table, cols, row...)
	if err != nil {
		return err
	}

	return nil
}

func (tx *Transaction) Delete(table string, id int) error {
	// Retrieve the record and ensure it's visible
	base, err := tx.selectRecord(table, id)
	if err != nil {
		log.Printf("Failed to read to record to be deleted for id %d from table %s: %v", id, table, err)
		return err
	}

	if !tx.IsRowVisible(base) {
		log.Printf("No visible record found for id %d from table %s: %v", id, table, err)
		return err
	}

	mu.Lock()
	defer mu.Unlock()

	// Look for any existing locks for the table/id combination
	var lockId int
	row := tx.mvccConn.QueryRowContext(tx.ctx, "SELECT id FROM locks WHERE record_table=$1 AND record_id=$2 ", table, id)
	err = row.Scan(lockId)
	if err == nil {
		return errors.New("Row already locked")
	}

	stmt := `INSERT INTO locks(record_table, record_id, txid) VALUES($1, $2, $3) RETURNING id`
	err = tx.mvccConn.QueryRowContext(tx.ctx, stmt, table, id, tx.ID).Scan(&lockId)
	if err != nil {
		log.Printf("Failed to insert the row lock for id %d from table %s: %v", id, table, err)
		return err
	}

	stmt = `UPDATE ` + table + ` SET tx_max = $1 WHERE id = $2;`
	_, err = tx.appConn.ExecContext(tx.ctx, stmt, tx.ID, id)
	if err != nil {
		log.Printf("Failed to mark id %d from table %s for deletion: %v", id, table, err)
		return err
	}

	tx.records = append(tx.records, Record{Table: table, ID: id, Operation: OpDelete, LockID: lockId})

	return nil
}

// Commits the changes performed during the transaction
// so other transactions can see them.
func (tx *Transaction) Commit() error {
	t, err := tx.mvccConn.BeginTx(tx.ctx, nil)
	if err != nil {
		return err
	}

	for _, r := range tx.records {
		switch r.Operation {
		case OpDelete:
			// Commit the MVCC change on the record
			stmt := `UPDATE ` + r.Table + ` SET tx_max_commited = TRUE WHERE tx_max = $1 AND id = $2;`
			_, err = tx.appConn.ExecContext(tx.ctx, stmt, tx.ID, r.ID)
			if err != nil {
				return err
			}

			// Release the lock
			stmt = `DELETE FROM locks WHERE id = $1`
			_, err = tx.mvccConn.ExecContext(tx.ctx, stmt, r.LockID)
			if err != nil {
				return err
			}
		case OpInsert:
			// Commit the MVCC change on the record
			stmt := `UPDATE ` + r.Table + ` SET tx_min_commited = TRUE WHERE tx_min = $1 AND id = $2;`
			_, err = tx.appConn.ExecContext(tx.ctx, stmt, tx.ID, r.ID)
			if err != nil {
				return err
			}
		}
	}

	// Update the transaction entry
	stmt := `UPDATE transactions SET status = $1 WHERE id = $2;`
	_, err = tx.mvccConn.ExecContext(tx.ctx, stmt, TxCommited, tx.ID)
	if err != nil {
		return err
	}

	return t.Commit()
}

func (tx *Transaction) Rollback() error {
	if tx.Status == TxCommited {
		// Transaction was successfully committed
		return nil
	}

	t, err := tx.mvccConn.BeginTx(tx.ctx, nil)
	if err != nil {
		return err
	}

	for _, r := range tx.records {
		switch r.Operation {
		case OpDelete:
			// Mark MVCC for rollback on the record
			stmt := `UPDATE ` + r.Table + ` SET tx_max_rolled_back = TRUE WHERE tx_max = $1 AND id = $2;`
			_, err = tx.appConn.ExecContext(tx.ctx, stmt, tx.ID, r.ID)
			if err != nil {
				return err
			}

			// Release the lock
			stmt = `DELETE FROM locks WHERE id = $1`
			_, err = tx.mvccConn.ExecContext(tx.ctx, stmt, r.LockID)
			if err != nil {
				return err
			}
		case OpInsert:
			// Mark MVCC for rollback on the record
			stmt := `UPDATE ` + r.Table + ` SET tx_min_rolled_back = TRUE WHERE tx_min = $1 AND id = $2;`
			_, err = tx.appConn.ExecContext(tx.ctx, stmt, tx.ID, r.ID)
			if err != nil {
				return err
			}
		}
	}

	// Update the transaction entry
	stmt := `UPDATE transactions SET status = $1 WHERE id = $2;`
	_, err = tx.mvccConn.ExecContext(tx.ctx, stmt, TxRolledBack, tx.ID)
	if err != nil {
		return err
	}

	return t.Commit()
}
