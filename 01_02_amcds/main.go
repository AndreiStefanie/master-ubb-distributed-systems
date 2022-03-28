package main

import (
	"log"
	"os"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/infra"
)

// func register(index int32) error {
// 	m := infra.Message{

// 	}
// 	// m := infra.ProcRegistration{
// 	// 	Owner: "sap",
// 	// 	Index: index,
// 	// }
// }

func main() {
	if len(os.Args) != 5 {
		log.Println("Usage: ./amcds <port> <owner> <index> <hub_port>")
		return
	}

	err := infra.Listen(os.Args[1], func(data []byte) {

	})
	if err != nil {
		log.Printf("Failed to start the process %v\n", err)
	}
}
