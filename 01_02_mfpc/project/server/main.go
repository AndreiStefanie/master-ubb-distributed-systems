package main

import (
	"crypto/tls"
	"log"
	"net"
	"os"
	"time"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/01_02_mfpc/project/server/api"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/01_02_mfpc/project/server/db"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/01_02_mfpc/project/server/mvcc"
	"github.com/joho/godotenv"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/reflection"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	pgUser := os.Getenv("POSTGRESQL_USER")
	pgPass := os.Getenv("POSTGRESQL_PASS")

	// Initialize the database connections
	// MVCC Postgres DB
	mvccCon, err := db.InitConnection(pgUser, pgPass, "mvcc")
	if err != nil {
		log.Fatalf("Could not connect to the MVCC database: %v", err)
	}
	defer mvccCon.Close()
	// App Postgres DB
	appConn, err := db.InitConnection(pgUser, pgPass, "neobank")
	if err != nil {
		log.Fatalf("Could not connect to the app database: %v", err)
	}
	defer appConn.Close()
	// MVCC Graph DB
	neoDriver, err := neo4j.NewDriver("bolt://localhost:7687", neo4j.BasicAuth(os.Getenv("NEO4J_USER"), os.Getenv("NEO4J_PASS"), ""))
	if err != nil {
		log.Fatalf("Could not connect to neo4j: %v", err)
	}
	defer neoDriver.Close()

	manager := mvcc.CreateManager(mvccCon, appConn, neoDriver)

	// Schedule the Vacuum to run every second
	ticker := time.NewTicker(10 * time.Second)
	go func() {
		for range ticker.C {
			manager.Vacuum()
		}
	}()
	defer ticker.Stop()
	defer manager.Cleanup()

	if err != nil {
		log.Fatal("cannot load TLS credentials: ", err)
	}

	log.Println("Server starting")

	lis, err := net.Listen("tcp", "localhost:8080")
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	a := api.CreateAPI(manager)
	s := grpc.NewServer()
	api.RegisterAccountServiceServer(s, a)

	reflection.Register(s)

	err = s.Serve(lis)
	if err != nil {
		log.Fatalf("Failed to start the server: %v", err)
	}
}

func loadTLSCredentials() (credentials.TransportCredentials, error) {
	serverCert, err := tls.LoadX509KeyPair("../cert/server-cert.pem", "../cert/server-key.pem")
	if err != nil {
		return nil, err
	}

	config := &tls.Config{
		Certificates: []tls.Certificate{serverCert},
		ClientAuth:   tls.NoClientCert,
	}

	return credentials.NewTLS(config), nil
}
