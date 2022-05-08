package util

import "regexp"

// GetRegisterId retrieves the register identifier from the abstraction
// app.nnar[x] -> x
func GetRegisterId(abstractionId string) string {
	re := regexp.MustCompile(`\[(.*)\]`)

	tokens := re.FindStringSubmatch(abstractionId)

	// [0] contains the full capturing group (e.g. "[x]") while [1] contains just the key (e.g. "x")
	return tokens[1]
}
