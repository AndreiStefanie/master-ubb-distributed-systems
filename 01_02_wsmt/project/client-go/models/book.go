package models

import "time"

type Book struct {
	ID              int64      `json:"ID,omitempty"`
	CreatedAt       *time.Time `json:"CreatedAt,omitempty"`
	DeletedAt       *time.Time `json:"DeletedAt,omitempty"`
	UpdatedAt       *time.Time `json:"UpdatedAt,omitempty"`
	Title           string     `json:"title" xml:"title" yaml:"title"`
	AuthorID        uint       `json:"authorId" xml:"authorId" yaml:"authorId"`
	Author          Author     `json:"author,omitempty" xml:"author" yaml:"author"`
	PublicationYear int        `json:"publicationYear" xml:"publicationYear" yaml:"publicationYear"`
}
