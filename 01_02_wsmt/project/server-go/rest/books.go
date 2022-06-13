package rest

import (
	"net/http"
	"strconv"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/wsmt/project/models"
	"github.com/gin-gonic/gin"
)

// getBooks retrieves all the books with the option to filter by title
func (api *Api) getBooks(c *gin.Context) {
	var books []models.Book

	result := api.Db.Preload("Author")

	query := c.Query("query")
	if query != "" {
		result = result.Where("title LIKE ?", "%"+query+"%")
	}

	result = result.Find(&books)

	setResponse(&books, result, c)
}

// getBook retrieves a certain book identified by the id
func (api *Api) getBook(c *gin.Context) {
	var book models.Book
	result := api.Db.Preload("Author").Find(&book, c.Param("id"))

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}

	setResponse(&book, result, c)
}

// createBook creates a new book resource with the data from the body
func (api *Api) createBook(c *gin.Context) {
	book := models.Book{}

	// Bind the data from the body to the Book model
	// See https://github.com/gin-gonic/gin#model-binding-and-validation
	if err := c.Bind(&book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	author, result := api.getAuthorById(strconv.Itoa(int(book.AuthorID)))

	// Add the book to the author's books associations
	err := api.Db.Model(&author).Association("Books").Append(&book)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	setResponse(&book, result, c)
}

// updateBook updates a book identified by the id with the data from the body
func (api *Api) updateBook(c *gin.Context) {
	book := models.Book{}
	r := api.Db.Find(&book, c.Param("id"))

	if r.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Author not found"})
		return
	}

	if err := c.Bind(&book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := api.Db.Save(&book)

	setResponse(&book, result, c)
}

// deleteBook deletes a book identified by the id
func (api *Api) deleteBook(c *gin.Context) {
	book := models.Book{}
	r := api.Db.Find(&book, c.Param("id"))

	if r.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Author not found"})
		return
	}

	result := api.Db.Select("Book").Delete(&book)

	setResponse(&book, result, c)
}

// getAuthorBooks retrieves all the books of the given author
func (api *Api) getAuthorBooks(c *gin.Context) {
	var books []models.Book
	result := api.Db.Preload("Author").Where("author_id = ?", c.Param("id")).Find(&books)

	setResponse(&books, result, c)
}
