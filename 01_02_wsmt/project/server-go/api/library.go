package api

import (
	"net/http"
	"strconv"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/wsmt/project/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Api struct {
	Db *gorm.DB
}

func CreateApi(db *gorm.DB, r *gin.Engine) *Api {
	api := &Api{
		Db: db,
	}

	addRoutes(r, api)

	return api
}

func addRoutes(router *gin.Engine, api *Api) {
	group := router.Group("/v1")

	authors := group.Group("/authors")
	authors.GET("", api.getAuthors)
}

func (api *Api) getAuthors(c *gin.Context) {
	var authors []models.Author
	result := api.Db.Find(&authors)

	c.Header("X-Total-Count", strconv.Itoa(int(result.RowsAffected)))
	c.JSON(http.StatusOK, authors)
}
