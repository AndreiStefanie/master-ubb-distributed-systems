package cmd

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/wsmt/client/services"
	"github.com/spf13/cobra"
)

// booksCmd represents the books command
var booksCmd = &cobra.Command{
	Use:   "books",
	Short: "Manage books",
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
			books, err := client.ListBooks(query)
			if err != nil {
				fmt.Printf("Failed to list books: %v\n", err)
				return
			}
			fmt.Printf("%v\n", prettyPrint(books))
		case "get":
			book, err := client.GetBook(args[0])
			if err != nil {
				fmt.Printf("Failed to get book: %v\n", err)
				return
			}
			if book.ID > 0 {
				fmt.Printf("%v\n", prettyPrint(book))
			}
		case "add":
			title, _ := cmd.Flags().GetString("title")
			year, _ := cmd.Flags().GetInt("year")
			author, _ := cmd.Flags().GetUint("author")
			_, err := client.AddBook(title, year, author)
			if err != nil {
				fmt.Printf("Failed to add book: %v\n", err)
				return
			}
		case "update":
			title, _ := cmd.Flags().GetString("title")
			_, err := client.UpdateBook(args[0], title)
			if err != nil {
				fmt.Printf("Failed to update book: %v\n", err)
				return
			}
		case "delete":
			book, err := client.DeleteBook(args[0])
			if err != nil {
				fmt.Printf("Failed to delete book: %v\n", err)
				return
			}
			if book.ID > 0 {
				fmt.Printf("%v\n", prettyPrint(book))
			}
		}
	},
}

func init() {
	var add = *booksCmd
	var list = *booksCmd
	var get = *booksCmd
	var update = *booksCmd
	var delete = *booksCmd

	add.PersistentFlags().String("title", "", "The book title")
	add.PersistentFlags().Int("year", 0, "The book publishing year")
	add.PersistentFlags().Uint("author", 0, "The author id")
	list.PersistentFlags().String("query", "", "Substring from book title")
	update.PersistentFlags().String("title", "", "The new books title")

	addCmd.AddCommand(&add)
	listCmd.AddCommand(&list)
	getCmd.AddCommand(&get)
	updateCmd.AddCommand(&update)
	deleteCmd.AddCommand(&delete)
}
