package main

import (
	"flag"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/hellofresh/health-go/v4"
	healthMysql "github.com/hellofresh/health-go/v4/checks/mysql"
)

func main() {
	port := flag.String("port", "8080", "The port on which this process should run")

	r := gin.Default()
	r.Use(gin.Recovery())

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Authorization", "Origin", "Content-Type"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	corsConfig.AddExposeHeaders("X-Total-Count", "X-Filename")
	r.Use(cors.New(corsConfig))

	h, _ := health.New()
	h.Register(health.Config{
		Name:      "mysql",
		Timeout:   time.Second * 2,
		SkipOnErr: false,
		Check: healthMysql.New(healthMysql.Config{
			DSN: "test:test@tcp(0.0.0.0:31726)/test?charset=utf8",
		}),
	})

	r.GET("/status", gin.WrapF(h.HandlerFunc))

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	r.Run(":" + *port)
}
