package services

import (
	"net/url"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/wsmt/client/models"
)

func (c *Client) ListBooks(query string) ([]models.Book, error) {
	url := &url.URL{Path: "/v1/books"}
	if query != "" {
		url.RawQuery = "query=" + query
	}
	req, err := c.newRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	var books []models.Book
	_, err = c.do(req, &books)

	return books, err
}

func (c *Client) GetBook(id string) (*models.Book, error) {
	req, err := c.newRequest("GET", &url.URL{Path: "/v1/books/" + id}, nil)
	if err != nil {
		return nil, err
	}

	var book models.Book
	_, err = c.do(req, &book)

	return &book, err
}

func (c *Client) AddBook(title string, year int, authorId uint) (*models.Book, error) {
	req, err := c.newRequest("POST", &url.URL{Path: "/v1/books"}, &models.Book{Title: title, PublicationYear: year, AuthorID: authorId})
	if err != nil {
		return nil, err
	}

	var book models.Book
	_, err = c.do(req, &book)

	return &book, err
}

func (c *Client) UpdateBook(id, title string) (*models.Book, error) {
	book, err := c.GetBook(id)
	if err != nil {
		return nil, err
	}

	book.Title = title
	req, err := c.newRequest("PUT", &url.URL{Path: "/v1/books/" + id}, book)
	if err != nil {
		return nil, err
	}

	var updatedBook models.Book
	_, err = c.do(req, &book)

	return &updatedBook, err
}

func (c *Client) DeleteBook(id string) (*models.Book, error) {
	req, err := c.newRequest("DELETE", &url.URL{Path: "/v1/books/" + id}, nil)
	if err != nil {
		return nil, err
	}

	var book models.Book
	_, err = c.do(req, &book)

	return &book, err
}
