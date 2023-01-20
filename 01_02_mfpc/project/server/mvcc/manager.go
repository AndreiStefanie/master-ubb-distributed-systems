package mvcc

import (
	"context"
	"database/sql"
)

type Manager struct {
	mvccConn *sql.DB
	AppConn  *sql.DB

	transactions []*Transaction
}

func CreateManager(mvccConn *sql.DB, appConn *sql.DB) *Manager {
	return &Manager{
		mvccConn: mvccConn,
		AppConn:  appConn,
	}
}

func (m *Manager) OpenTx(ctx context.Context) (*Transaction, error) {
	tx, err := openTx(ctx, m.mvccConn, m.AppConn)
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
