package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

// addCmd represents the add command
var addCmd = &cobra.Command{
	Use:   "add",
	Short: "Add a new resource entity",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Error: must also specify a resource like authors or books")
	},
}

func init() {
	rootCmd.AddCommand(addCmd)
}
