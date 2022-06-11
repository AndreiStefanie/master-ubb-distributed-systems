package models

import "gorm.io/gorm"

type Book struct {
	gorm.Model
	Title           string `json:"title"`
	AuthorID        string `json:"-"`
	Author          Author `json:"author"`
	PublicationYear int    `json:"publicationYear"`
}
