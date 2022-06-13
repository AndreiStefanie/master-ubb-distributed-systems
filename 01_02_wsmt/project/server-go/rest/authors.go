package rest

import (
	"net/http"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/wsmt/project/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// getAuthors retrieves all the authors with the option to filter by name
func (api *Api) getAuthors(c *gin.Context) {
	var authors []models.Author

	result := api.Db

	query := c.Query("query")
	if query != "" {
		result = result.Where("name LIKE ?", "%"+query+"%")
	}

	result = result.Find(&authors)

	setResponse(&authors, result, c)
}

// getAuthor retrieves a certain author identified by the id
func (api *Api) getAuthor(c *gin.Context) {
	author, result := api.getAuthorById(c.Param("id"))

	setResponse(&author, result, c)
}

// createAuthor creates a new author resource with the data from the body
func (api *Api) createAuthor(c *gin.Context) {
	author := models.Author{}

	// Bind the data from the body to the Author model
	// See https://github.com/gin-gonic/gin#model-binding-and-validation
	if err := c.Bind(&author); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := api.Db.Create(&author)

	setResponse(&author, result, c)
}

// updateAuthor updates an author identified by the id with the data from the body
func (api *Api) updateAuthor(c *gin.Context) {
	author, _ := api.getAuthorById(c.Param("id"))

	if err := c.Bind(&author); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := api.Db.Save(&author)

	setResponse(&author, result, c)
}

// deleteAuthor deletes an author identified by the id including his/her books
func (api *Api) deleteAuthor(c *gin.Context) {
	author, _ := api.getAuthorById(c.Param("id"))

	result := api.Db.Select("Books").Delete(&author)

	setResponse(&author, result, c)
}

func (api *Api) getAuthorById(id string) (*models.Author, *gorm.DB) {
	var author models.Author
	result := api.Db.Find(&author, id)
	return &author, result
}
