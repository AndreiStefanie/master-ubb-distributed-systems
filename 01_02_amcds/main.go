package main

import (
	"flag"
	"fmt"
	"log"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/infra"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pl"
)

func register(pl *pl.PerfectLink, hubAddress, owner string, index int32) error {
	m := &pb.Message{
		Type: pb.Message_PL_SEND,
		PlSend: &pb.PlSend{
			Message: &pb.Message{
				Type: pb.Message_PROC_REGISTRATION,
				ProcRegistration: &pb.ProcRegistration{
					Owner: owner,
					Index: index,
				},
			},
		},
	}

	return pl.Send(hubAddress, m)
}

func main() {
	owner := flag.String("owner", "sap", "The owner alias of the process")
	hubAddress := flag.String("hub", "127.0.0.1:5000", "The host:port where the hub is running")
	port := flag.Int("port", 5004, "The port on which this process should run")
	index := flag.Int("index", 1, "The index of the process")

	host := "127.0.0.1"

	events := make(chan *pb.Message)
	pl := pl.Create(host, int32(*port))

	// Register the process
	err := register(pl, *hubAddress, *owner, int32(*index))
	if err != nil {
		log.Fatalf("Failed to register the process %v\n", err)
	}

	// Start listening for messages
	log.Printf("%v-%v listening on port %v\n", *owner, *index, *port)
	err = infra.Listen(host+":"+fmt.Sprint(*port), func(data []byte) {
		log.Printf("Received message %v\n", pl.Receive(data, events))
	})
	if err != nil {
		log.Fatalf("Failed to start the process %v\n", err)
	}
}
