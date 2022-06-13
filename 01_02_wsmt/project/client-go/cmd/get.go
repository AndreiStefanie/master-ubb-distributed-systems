package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

// getCmd represents the get command
var getCmd = &cobra.Command{
	Use:   "get",
	Short: "Retrieve the representation of a single resource",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Error: must also specify a resource like authors or books")
	},
}

func init() {
	rootCmd.AddCommand(getCmd)
}
