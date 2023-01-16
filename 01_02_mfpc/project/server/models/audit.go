package models

import "time"

type AuditEntry struct {
	Timestamp time.Time
	Operation string
	UserID    int
}
