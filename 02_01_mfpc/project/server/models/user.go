package models

import "github.com/AndreiStefanie/master-ubb-distributed-systems/01_02_mfpc/project/server/mvcc"

type User struct {
	mvcc.RecordBase
	ID       int
	Username string
}
