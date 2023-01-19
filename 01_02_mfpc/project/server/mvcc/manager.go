package mvcc

import (
	"context"
	"database/sql"
)

type Manager struct {
	mvccConn *sql.DB
	AppConn  *sql.DB
}

func CreateManager(mvccConn *sql.DB, appConn *sql.DB) *Manager {
	return &Manager{
		mvccConn: mvccConn,
		AppConn:  appConn,
	}
}

func (m *Manager) OpenTx(ctx context.Context) (*Transaction, error) {
	return openTx(ctx, m.mvccConn, m.AppConn)
}

func (m *Manager) Vacuum() (int, error) {
	ctx, stop := context.WithCancel(context.Background())
	defer stop()

	return vacuum(ctx, m.mvccConn, m.AppConn)
}
