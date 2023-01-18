package main

import (
	"context"
	"log"
	"os"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/01_02_mfpc/project/server/db"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/01_02_mfpc/project/server/mvcc"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	ctx, stop := context.WithCancel(context.Background())
	defer stop()

	pgUser := os.Getenv("POSTGRESQL_USER")
	pgPass := os.Getenv("POSTGRESQL_PASSWORD")

	mvccCon, err := db.InitConnection(pgUser, pgPass, "mvcc")
	if err != nil {
		log.Fatalf("Could not connect to the MVCC database: %v", err)
	}
	defer mvccCon.Close()

	appConn, err := db.InitConnection(pgUser, pgPass, "neobank")
	if err != nil {
		log.Fatalf("Could not connect to the app database: %v", err)
	}
	defer appConn.Close()

	defer mvcc.Vacuum(mvccCon, appConn)

	tx, _ := mvcc.OpenTx(ctx, mvccCon, appConn)
	// user := models.User{}
	// tx.Select("users", 1, &user.ID, &user.Username)

	// log.Println(fmt.Sprintf("%+v", user))

	// err = tx.Delete("accounts", 1)
	// if err != nil {
	// 	log.Fatalf("%v", err)
	// }
	id, _ := tx.Insert("accounts", []string{"user_id", "balance"}, 1, 100)
	tx.Commit()

	tx, _ = mvcc.OpenTx(ctx, mvccCon, appConn)
	tx.Update("accounts", id, []string{"balance"}, 120)
	tx.Commit()

	// Open another transaction and try to read the deleted account
	// tx, _ = mvcc.OpenTx(ctx, mvccCon, appConn)
	// account := models.Account{}
	// tx.Select("accounts", 1, &account.ID, &account.UserID, &account.Balance)
	// log.Println(fmt.Sprintf("%+v", account))
	// tx.Commit()
}
