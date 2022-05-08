package main

import (
	"flag"
	"fmt"
	"net"
	"os"
	"os/signal"
	"strconv"
	"syscall"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/infra"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pl"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/system"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/util/log"
)

type SystemInventory = map[string]*system.System

func register(pl *pl.PerfectLink, owner string, index int32, hubAddress string) error {
	hubHost, hubPortS, err := net.SplitHostPort(hubAddress)
	if err != nil {
		return err
	}
	hubPort, err := strconv.ParseInt(hubPortS, 10, 32)
	if err != nil {
		return err
	}

	m := &pb.Message{
		Type: pb.Message_PL_SEND,
		PlSend: &pb.PlSend{
			Destination: &pb.ProcessId{
				Host: hubHost,
				Port: int32(hubPort),
			},
			Message: &pb.Message{
				Type: pb.Message_PROC_REGISTRATION,
				ProcRegistration: &pb.ProcRegistration{
					Owner: owner,
					Index: index,
				},
			},
		},
	}

	return pl.Handle(m)
}

func main() {
	owner := flag.String("owner", "sap", "The owner alias of the process")
	hubAddress := flag.String("hub", "127.0.0.1:5000", "The host:port where the hub is running")
	port := flag.Int("port", 5004, "The port on which this process should run")
	index := flag.Int("index", 1, "The index of the process")
	flag.Parse()

	host := "127.0.0.1"

	log.Instantiate()

	networkMessages := make(chan *pb.Message, 4096)

	// Initialize the pl used by the system
	// It is responsible only for the initial registration and
	// parsing all incoming messages (it doesn't actually handle them)
	pl := pl.Create(host, int32(*port), *hubAddress)

	// Register the process
	err := register(pl, *owner, int32(*index), *hubAddress)
	if err != nil {
		log.Fatal("Failed to register the process %v", err)
	}

	// Start listening for messages
	l, err := infra.Listen(host+":"+fmt.Sprint(*port), func(data []byte) {
		m, err := pl.Parse(data)
		if err != nil {
			log.Info("Failed to parse the incomming message %v", err)
		}

		networkMessages <- m
	})
	if err != nil {
		log.Fatal("Failed to setup server listener: %v", err)
	}
	defer l.Close()
	log.Info("%v-%v listening on port %v", *owner, *index, *port)

	systems := make(SystemInventory, 0)
	// Process link messages
	go func() {
		for m := range networkMessages {
			switch m.NetworkMessage.Message.Type {
			case pb.Message_PROC_DESTROY_SYSTEM:
				// Destroy the existing system if any
				if s, ok := systems[m.SystemId]; ok {
					s.Destroy()
					s = nil
				}
			case pb.Message_PROC_INITIALIZE_SYSTEM:
				// Perform the initialization for a new system
				s := system.CreateSystem(m.NetworkMessage.Message, host, *owner, *hubAddress, int32(*port), int32(*index))
				s.RegisterAbstractions()
				s.StartEventLoop()
				systems[m.SystemId] = s
			default:
				if s, ok := systems[m.SystemId]; ok {
					// Delegate the messages to the system handler
					s.AddMessage(m)
				} else {
					log.Warn("System %v not initialized", m.SystemId)
				}
			}
		}
	}()

	quitChannel := make(chan os.Signal, 1)
	signal.Notify(quitChannel, syscall.SIGINT, syscall.SIGTERM)
	<-quitChannel
}
