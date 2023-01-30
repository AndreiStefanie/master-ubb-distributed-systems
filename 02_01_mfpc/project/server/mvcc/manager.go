package mvcc

import (
	"context"
	"database/sql"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

type Manager struct {
	mvccConn *sql.DB
	AppConn  *sql.DB
	neoConn  neo4j.Driver

	transactions []*Transaction
}

func CreateManager(mvccConn *sql.DB, appConn *sql.DB, neoConn neo4j.Driver) *Manager {
	return &Manager{
		mvccConn: mvccConn,
		AppConn:  appConn,
		neoConn:  neoConn,
	}
}

func (m *Manager) OpenTx(ctx context.Context) (*Transaction, error) {
	tx, err := openTx(ctx, m.mvccConn, m.AppConn, m.neoConn)
	if err != nil {
		return nil, err
	}

	m.transactions = append(m.transactions, tx)

	return tx, nil
}

func (m *Manager) Vacuum() (int, error) {
	ctx, stop := context.WithCancel(context.Background())
	defer stop()

	return vacuum(ctx, m.mvccConn, m.AppConn)
}

func (m *Manager) Cleanup() {
	// Commit all still open transactions (the dev didn't call commit/rollback)
	for _, tx := range m.transactions {
		tx.Commit()
	}

	m.Vacuum()
}
