package models

import "gorm.io/gorm"

type Book struct {
	gorm.Model
	Title           string `json:"title" xml:"title" yaml:"title" binding:"required"`
	AuthorID        uint   `json:"authorId" xml:"authorId" yaml:"authorId" binding:"required"`
	Author          Author `json:"author" xml:"author" yaml:"author" binding:"-"`
	PublicationYear int    `json:"publicationYear" xml:"publicationYear" yaml:"publicationYear" binding:"required"`
}
