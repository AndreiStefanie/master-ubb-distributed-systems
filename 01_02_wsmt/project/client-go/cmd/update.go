package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

// updateCmd represents the update command
var updateCmd = &cobra.Command{
	Use:   "update",
	Short: "Update an entity for a given resource",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Error: must also specify a resource like authors or books")
	},
}

func init() {
	rootCmd.AddCommand(updateCmd)
}
