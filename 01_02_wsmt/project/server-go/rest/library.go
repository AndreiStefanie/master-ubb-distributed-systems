package rest

import (
	"net/http"
	"strconv"

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
	{
		authors.GET("", api.getAuthors)
		authors.POST("", api.createAuthor)
		authors.GET(":id", api.getAuthor)
		authors.PUT(":id", api.updateAuthor)
		authors.DELETE(":id", api.deleteAuthor)
		authors.GET(":id/books", api.getAuthorBooks)
	}

	books := group.Group("/books")
	{
		books.GET("", api.getBooks)
		books.POST("", api.createBook)
		books.GET(":id", api.getBook)
		books.PUT(":id", api.updateBook)
		books.DELETE(":id", api.deleteBook)
	}
}

func setResponse(resources interface{}, result *gorm.DB, c *gin.Context) {
	c.Header("X-Total-Count", strconv.Itoa(int(result.RowsAffected)))

	if result.Error != nil {
		c.String(http.StatusInternalServerError, result.Error.Error())
		return
	}

	var status int

	switch c.Request.Method {
	case http.MethodPost:
		status = http.StatusCreated
	case http.MethodPut, http.MethodDelete:
		status = http.StatusNoContent
	default:
		status = http.StatusOK
	}

	switch c.ContentType() {
	case "application/json":
		c.JSON(status, resources)
	case "application/xml":
		c.XML(status, resources)
	case "application/yaml":
		c.YAML(status, resources)
	default:
		c.JSON(status, resources)
	}
}
