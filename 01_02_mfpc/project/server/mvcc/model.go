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
	Table  string
	ID     int
	Record string
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
	operations []Record
	// The SQL connection for MVCC
	sql *sql.DB
	//
	appSql *sql.DB
	ctx    context.Context
}

// Intended to be embedded by all application records
type RecordBase struct {
	// Indicates the transaction that created the row (version).
	TxMin int

	// Indicates the transaction that deleted the row (version).
	// Can be set after an UPDATE or DELETE.
	TxMax int

	// Indicates that the tx_max value is commited.
	// This allows other transactions to consider it.
	TxMaxCommited bool

	// Indicates that the tx_max value was set, but the transaction was aborted.
	TxMaxRolledBack bool
}
