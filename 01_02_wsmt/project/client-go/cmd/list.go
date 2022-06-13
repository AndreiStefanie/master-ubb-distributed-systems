package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

// listCmd represents the list command
var listCmd = &cobra.Command{
	Use:   "list",
	Short: "Retrieve all entities for a resource",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Error: must also specify a resource like authors or books")
	},
}

func init() {
	rootCmd.AddCommand(listCmd)
}
