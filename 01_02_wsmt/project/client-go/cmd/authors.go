package cmd

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/wsmt/client/services"
	"github.com/spf13/cobra"
)

// authorsCmd represents the authors command
var authorsCmd = &cobra.Command{
	Use:   "authors",
	Short: "Manage authors",
	Run: func(cmd *cobra.Command, args []string) {
		url, err := url.Parse("http://localhost:8080")
		if err != nil {
			fmt.Printf("Failed to setup the client: %v\n", err)
			return
		}
		client := services.CreateClient(url, http.DefaultClient)
		path := strings.Split(cmd.CommandPath(), " ")

		switch path[1] {
		case "list":
			query, _ := cmd.Flags().GetString("query")
			authors, err := client.ListAuthors(query)
			if err != nil {
				fmt.Printf("Failed to list authors: %v\n", err)
				return
			}
			fmt.Printf("%v\n", prettyPrint(authors))
		case "get":
			author, err := client.GetAuthor(args[0])
			if err != nil {
				fmt.Printf("Failed to get author: %v\n", err)
				return
			}
			if author.ID > 0 {
				fmt.Printf("%v\n", prettyPrint(author))
			}
		case "add":
			name, _ := cmd.Flags().GetString("name")
			_, err := client.AddAuthor(name)
			if err != nil {
				fmt.Printf("Failed to add author: %v\n", err)
				return
			}
		case "update":
			name, _ := cmd.Flags().GetString("name")
			_, err := client.UpdateAuthor(args[0], name)
			if err != nil {
				fmt.Printf("Failed to update author: %v\n", err)
				return
			}
		case "delete":
			author, err := client.DeleteAuthor(args[0])
			if err != nil {
				fmt.Printf("Failed to delete author: %v\n", err)
				return
			}
			if author.ID > 0 {
				fmt.Printf("%v\n", prettyPrint(author))
			}
		}
	},
}

func init() {
	var add = *authorsCmd
	var list = *authorsCmd
	var get = *authorsCmd
	var update = *authorsCmd
	var delete = *authorsCmd

	add.PersistentFlags().String("name", "", "The author's name")
	list.PersistentFlags().String("query", "", "Substring from author name")
	update.PersistentFlags().String("name", "", "The new author name")

	addCmd.AddCommand(&add)
	listCmd.AddCommand(&list)
	getCmd.AddCommand(&get)
	updateCmd.AddCommand(&update)
	deleteCmd.AddCommand(&delete)
}
