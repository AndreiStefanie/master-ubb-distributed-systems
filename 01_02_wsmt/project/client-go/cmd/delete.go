package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

// deleteCmd represents the delete command
var deleteCmd = &cobra.Command{
	Use:   "delete",
	Short: "Delete a resource entity",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Error: must also specify a resource like authors or books")
	},
}

func init() {
	rootCmd.AddCommand(deleteCmd)
}
