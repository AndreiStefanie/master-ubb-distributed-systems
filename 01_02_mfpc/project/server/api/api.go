package api

import (
	context "context"
	"errors"
	"strconv"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/01_02_mfpc/project/server/mvcc"
	"google.golang.org/grpc/metadata"
)

type api struct {
	UnimplementedAccountServiceServer
	mvcc *mvcc.Manager
}

func CreateAPI(mvcc *mvcc.Manager) *api {
	return &api{
		mvcc: mvcc,
	}
}

func (a *api) Get(ctx context.Context, req *GetAccountRequest) (*AccountResponse, error) {
	tx, err := a.mvcc.OpenTx(ctx)
	if err != nil {
		return nil, err
	}

	res := &AccountResponse{}

	userID, err := getUserId(ctx)
	if err != nil {
		return nil, err
	}

	tx.Select("accounts", userID)

	return res, nil
}

func (a *api) List(ctx context.Context, req *ListAccountsRequest) (*ListAccountsResponse, error) {
	userID, err := getUserId(ctx)
	if err != nil {
		return nil, err
	}

	tx, err := a.mvcc.OpenTx(ctx)
	if err != nil {
		return nil, err
	}

	rows, err := a.mvcc.AppConn.QueryContext(ctx, "SELECT * FROM accounts WHERE user_id = $1", userID)
	if err != nil {
		return nil, err
	}

	res := &ListAccountsResponse{
		Accounts: []*Account{},
	}

	for rows.Next() {
		var account Account
		var base mvcc.RecordBase
		rows.Scan(&base.TxMin, &base.TxMax, &base.TxMinCommited, &base.TxMinRolledBack, &base.TxMaxCommited, &base.TxMaxRolledBack, &account.Id, &account.UserId, &account.Balance)
		if tx.IsRowVisible(&base) {
			res.Accounts = append(res.Accounts, &account)
			break
		}
	}

	err = tx.Commit()
	if err != nil {
		return nil, err
	}

	return res, nil
}

func (a *api) Deposit(ctx context.Context, req *OperationRequest) (*AccountResponse, error) {
	tx, err := a.mvcc.OpenTx(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	acc := Account{}
	tx.Select("accounts", int(req.AccountId), &acc.Id, &acc.UserId, &acc.Balance)

	newBalance := acc.Balance + req.Amount

	err = tx.Update("accounts", int(req.AccountId), []string{"balance"}, newBalance)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	err = tx.Commit()
	if err != nil {
		return nil, err
	}

	tx, err = a.mvcc.OpenTx(ctx)
	if err != nil {
		return nil, err
	}

	acc = Account{}
	tx.Select("accounts", int(req.AccountId), &acc.Id, &acc.UserId, &acc.Balance)

	res := &AccountResponse{Account: &acc}

	return res, nil
}

func getUserId(ctx context.Context) (int, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return 0, errors.New("userId metadata not set")
	}

	userID, err := strconv.Atoi(md.Get("user-id")[0])
	if err != nil {
		return 0, err
	}

	return userID, nil
}
