package mvcc

import (
	"context"
	"database/sql"
	"time"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

const (
	TxActive     = "active"
	TxCommitted  = "committed"
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
	// `active`, `committed`, or `rolled_back`
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
	// The Neo4j connection
	neoConn neo4j.Driver
	ctx     context.Context
}

// Intended to be embedded by all application records
type RecordBase struct {
	// Indicates the transaction that created the row (version).
	TxMin int

	// Indicates the transaction that deleted the row (version).
	// Can be set after an UPDATE or DELETE.
	TxMax int

	// Indicates that the tx_min value is committed.
	// This allows other transactions to consider it.
	TxMinCommitted bool

	// Indicates that the tx_min value was set, but the transaction was rolled back.
	TxMinRolledBack bool

	// Indicates that the tx_max value is committed.
	// This allows other transactions to consider it.
	TxMaxCommitted bool

	// Indicates that the tx_max value was set, but the transaction was rolled back.
	TxMaxRolledBack bool
}
