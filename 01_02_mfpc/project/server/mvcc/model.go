package mvcc

import (
	"context"
	"database/sql"
	"time"
)

const (
	TxActive     = "active"
	TxCommited   = "commited"
	TxRolledBack = "rolled_back"
)

const (
	OpInsert = "insert"
	OpUpdate = "update"
	OpDelete = "delete"
)

type Record struct {
	Table     string
	ID        int
	Operation string
	LockID    int
}

type TransactionData struct {
	// The ID of the transaction. Monotonicly increasing series
	ID int
	// When the transaction was created
	CreatedAt time.Time
	// `active`, `commited`, or `rolled_back`
	Status string
}

// Used internaly to keep track of the database transactions
type Transaction struct {
	// Fields stored in the DB
	TransactionData

	// Fields stored only in memory
	records []Record
	// The SQL connection for MVCC
	mvccConn *sql.DB
	// The SQL connection for the application database
	appConn *sql.DB
	ctx     context.Context
}

// Intended to be embedded by all application records
type RecordBase struct {
	// Indicates the transaction that created the row (version).
	TxMin int

	// Indicates the transaction that deleted the row (version).
	// Can be set after an UPDATE or DELETE.
	TxMax int

	// Indicates that the tx_min value is commited.
	// This allows other transactions to consider it.
	TxMinCommited bool

	// Indicates that the tx_min value was set, but the transaction was rolled back.
	TxMinRolledBack bool

	// Indicates that the tx_max value is commited.
	// This allows other transactions to consider it.
	TxMaxCommited bool

	// Indicates that the tx_max value was set, but the transaction was rolled back.
	TxMaxRolledBack bool
}
