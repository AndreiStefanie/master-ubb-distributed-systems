package services

import (
	"net/url"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/wsmt/client/models"
)

func (c *Client) ListAuthors(query string) ([]models.Author, error) {
	url := &url.URL{Path: "/v1/authors"}
	if query != "" {
		url.RawQuery = "query=" + query
	}
	req, err := c.newRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	var authors []models.Author
	_, err = c.do(req, &authors)

	return authors, err
}

func (c *Client) GetAuthor(id string) (*models.Author, error) {
	req, err := c.newRequest("GET", &url.URL{Path: "/v1/authors/" + id}, nil)
	if err != nil {
		return nil, err
	}

	var author models.Author
	_, err = c.do(req, &author)

	return &author, err
}

func (c *Client) AddAuthor(name string) (*models.Author, error) {
	req, err := c.newRequest("POST", &url.URL{Path: "/v1/authors"}, &models.Author{Name: name})
	if err != nil {
		return nil, err
	}

	var author models.Author
	_, err = c.do(req, &author)

	return &author, err
}

func (c *Client) UpdateAuthor(id, name string) (*models.Author, error) {
	req, err := c.newRequest("PUT", &url.URL{Path: "/v1/authors/" + id}, &models.Author{Name: name})
	if err != nil {
		return nil, err
	}

	var author models.Author
	_, err = c.do(req, &author)

	return &author, err
}

func (c *Client) DeleteAuthor(id string) (*models.Author, error) {
	req, err := c.newRequest("DELETE", &url.URL{Path: "/v1/authors/" + id}, nil)
	if err != nil {
		return nil, err
	}

	var author models.Author
	_, err = c.do(req, &author)

	return &author, err
}
