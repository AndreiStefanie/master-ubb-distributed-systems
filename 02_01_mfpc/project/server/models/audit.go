package models

type AuditEntry struct {
	ID int

	// The Unix timestamp of when the operation took place
	Timestamp int64

	// Description of what the user did
	Operation string

	// The user that performed the action
	UserID int
}
