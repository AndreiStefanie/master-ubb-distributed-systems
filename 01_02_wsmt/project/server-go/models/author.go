package models

import "gorm.io/gorm"

type Author struct {
	gorm.Model
	Name  string `json:"name" xml:"name" yaml:"name" binding:"required"`
	Books []Book `json:"-" xml:"-" yaml:"-" binding:"-"`
}
