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

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
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
func openTx(ctx context.Context, sqlDb *sql.DB, appSql *sql.DB, neoConn neo4j.Driver) (*Transaction, error) {
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
		neoConn:         neoConn,
		ctx:             ctx,
	}

	err = tx.createTxNode()
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	return tx, nil
}

func (tx *Transaction) IsRowVisible(row *RecordBase) bool {
	if row.TxMin > tx.ID || row.TxMinRolledBack {
		// Row created after the current transaction or the insert was aborted
		return false
	}

	if row.TxMin < tx.ID && !row.TxMinCommitted {
		// Row created by a concurrent transaction
		return false
	}

	if row.TxMax < tx.ID && row.TxMaxCommitted {
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
	if err != nil {
		return nil, err
	}
	defer rows.Close()

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
			case "tx_min_committed":
				base.TxMinCommitted = sv.Bool()
			case "tx_min_rolled_back":
				base.TxMinRolledBack = sv.Bool()
			case "tx_max_committed":
				base.TxMaxCommitted = sv.Bool()
			case "tx_max_rolled_back":
				base.TxMaxRolledBack = sv.Bool()
			}
		}

		// Look for the visible row. Pick the last one
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

	// New rows have the `tx_min` set to the current transaction and
	// `tx_max_rolled_back` set to true so `tx_max` (which is 0) is ignored
	f := append([]string{"tx_min", "tx_max", "tx_max_rolled_back"}, fields...)
	stmt += strings.Join(f, ", ")

	stmt += ") VALUES("
	r := makeRange(1, len(values)+3)
	stmt += strings.Join(r, ", ")
	stmt += ") RETURNING id"

	err := tx.appConn.QueryRowContext(tx.ctx, stmt, append([]any{tx.ID, 0, true}, values...)...).Scan(&id)
	if err != nil {
		return 0, err
	}

	tx.records = append(tx.records, Record{Table: table, ID: id, Operation: OpInsert})

	return id, nil
}

// Update is basically delete, select (considering the tx_max), and insert
func (tx *Transaction) Update(table string, id int, fields []string, values ...any) error {
	err := tx.Delete(table, id)
	if err != nil {
		return err
	}

	// Select the row that was just marked for deletion (based on `tx_max`).
	// We need to use Query instead of QueryRow because the latter does not
	// return the columns so we cannot dynamically retrieve the data.
	// There should be only one row.
	rows, err := tx.appConn.QueryContext(tx.ctx, "SELECT * FROM "+table+" WHERE id=$1 AND tx_max=$2", id, tx.ID)
	if err != nil {
		return err
	}
	defer rows.Close()

	cols, _ := rows.Columns()
	row := make([]interface{}, len(cols))
	for i := range cols {
		row[i] = new(interface{})
	}

	rowScanned := false
	for rows.Next() {
		// Ensure only one row is actually read
		if rowScanned {
			return errors.New("Multiple rows returned during update")
		}
		rowScanned = true

		rows.Scan(row...)

		// Reset the tx_max fields
		// `tx_max`
		dv := reflect.Indirect(reflect.ValueOf(row[1]))
		dv.Set(reflect.ValueOf(0))
		// `tx_max_rolled_back`
		dv = reflect.Indirect(reflect.ValueOf(row[5]))
		dv.Set(reflect.ValueOf(false))

		// Merge the new values into the row
		for i, f := range fields {
			index := slices.Index(cols, f)
			dv := reflect.Indirect(reflect.ValueOf(row[index]))
			dv.Set(reflect.ValueOf(values[i]))
		}
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
	var base *RecordBase
	var err error

	base, err = tx.selectRecord(table, id)
	if err != nil {
		return err
	}

	if !tx.IsRowVisible(base) {
		return errors.New(fmt.Sprintf("Transaction %v aborted due to concurrency", tx.ID))
	}

	mu.Lock()
	defer mu.Unlock()

	// Look for any existing locks for the table/id combination
	// TODO: Remove these. If the row is locked, the program will not reach this
	// since the row is not visible to other (this) transactions
	var lockId int
	row := tx.mvccConn.QueryRowContext(tx.ctx, "SELECT id FROM locks WHERE record_table=$1 AND record_id=$2 ", table, id)
	err = row.Scan(lockId)
	if err == nil {
		return errors.New("Row already locked")
	}

	tx.addResourceDependency(table, id)

	stmt := `INSERT INTO locks(record_table, record_id, txid) VALUES($1, $2, $3) RETURNING id`
	err = tx.mvccConn.QueryRowContext(tx.ctx, stmt, table, id, tx.ID).Scan(&lockId)
	if err != nil {
		log.Printf("Failed to insert the row lock for id %d from table %s: %v", id, table, err)
		return err
	}

	tx.addResourceLock(table, id)

	stmt = `UPDATE ` + table + ` SET tx_max = $1, tx_max_rolled_back = FALSE WHERE tx_min = $2 AND id = $3;`
	_, err = tx.appConn.ExecContext(tx.ctx, stmt, tx.ID, base.TxMin, id)
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
			stmt := `UPDATE ` + r.Table + ` SET tx_max_committed = TRUE WHERE tx_max = $1 AND id = $2;`
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
			stmt := `UPDATE ` + r.Table + ` SET tx_min_committed = TRUE WHERE tx_min = $1 AND id = $2;`
			_, err = tx.appConn.ExecContext(tx.ctx, stmt, tx.ID, r.ID)
			if err != nil {
				return err
			}
		}
	}

	// Update the transaction entry
	stmt := `UPDATE transactions SET status = $1 WHERE id = $2;`
	_, err = tx.mvccConn.ExecContext(tx.ctx, stmt, TxCommitted, tx.ID)
	if err != nil {
		return err
	}

	tx.Status = TxCommitted

	// tx.deleteTxNodes()

	return t.Commit()
}

// Rolls back the transaction. Does nothing if the transcation was successfully committed
func (tx *Transaction) Rollback() error {
	if tx.Status == TxCommitted {
		// Transaction was successfully committed
		return nil
	}

	log.Printf("Rolling back transaction %v", tx.ID)

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

	tx.Status = TxRolledBack

	// tx.deleteTxNodes()

	return t.Commit()
}
