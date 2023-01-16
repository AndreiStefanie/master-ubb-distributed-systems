package db

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

func InitConnection(user, pass, database string) (*sql.DB, error) {
	connInfo := fmt.Sprintf("user=%s password=%s dbname=%s sslmode=disable", user, pass, database)

	return sql.Open("postgres", connInfo)
}
