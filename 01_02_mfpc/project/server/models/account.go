package models

import "github.com/AndreiStefanie/master-ubb-distributed-systems/01_02_mfpc/project/server/mvcc"

type Account struct {
	mvcc.RecordBase
	ID      int
	UserID  int
	Balance int
}
