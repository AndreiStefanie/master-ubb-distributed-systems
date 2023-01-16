package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/01_02_mfpc/project/server/db"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/01_02_mfpc/project/server/models"
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

	tx, err := mvcc.OpenTx(ctx, mvccCon, appConn)
	if err != nil {
		log.Fatalf("Could not open new transaction: %v", err)
	}

	user := models.User{}
	tx.Select("users", 1, &user.ID, &user.Username)

	log.Println(fmt.Sprintf("%+v", user))

	tx.Commit()
}
