package models

import "time"

type Author struct {
	ID        int64      `json:"ID,omitempty"`
	CreatedAt *time.Time `json:"CreatedAt,omitempty"`
	DeletedAt *time.Time `json:"DeletedAt,omitempty"`
	UpdatedAt *time.Time `json:"UpdatedAt,omitempty"`
	Name      string     `json:"name" xml:"name" yaml:"name" binding:"required"`
}
