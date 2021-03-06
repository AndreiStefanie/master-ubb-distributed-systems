package main

import (
	"os"
	"time"

	log "github.com/AndreiStefanie/master-ubb-distributed-systems/wsmt/project/log"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/wsmt/project/models"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/wsmt/project/rest"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/hellofresh/health-go/v4"
	healthMysql "github.com/hellofresh/health-go/v4/checks/mysql"
	_ "github.com/joho/godotenv/autoload"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dsn := os.Getenv("DB_CONNECTION_STRING")
	if dsn == "" {
		log.Fatal("Database connection string expected in DB_CONNECTION_STRING")
	}

	log.Instantiate()

	// Connect to the database
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to DB: %v", err)
	}
	db.AutoMigrate(&models.Author{}, &models.Book{})

	// Create the router
	r := gin.Default()
	r.Use(gin.Recovery())

	// Configure CORS
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"http://localhost"}
	corsConfig.AllowHeaders = []string{"Authorization", "Origin", "Content-Type"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	corsConfig.AddExposeHeaders("X-Total-Count", "X-Filename")
	r.Use(cors.New(corsConfig))

	r.SetTrustedProxies(nil)

	// Configure the health check
	h, err := health.New()
	if err != nil {
		log.Fatal("Failed to create health checks: %v", err)
	}
	h.Register(health.Config{
		Name:      "mysql",
		Timeout:   time.Second * 2,
		SkipOnErr: false,
		Check:     healthMysql.New(healthMysql.Config{DSN: dsn}),
	})
	r.GET("/status", gin.WrapF(h.HandlerFunc))

	// Add the resource routes
	rest.CreateApi(db, r)

	// Start the server
	err = r.Run(":" + port)
	if err != nil {
		log.Fatal("Failed to start the server: %v", err)
	}
}
