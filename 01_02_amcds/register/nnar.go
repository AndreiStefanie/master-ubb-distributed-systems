package register

import (
	"log"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/broadcast"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pl"
)

type NnAtomicRegister struct {
	beb *broadcast.BestEffortBroadcast
	pl  *pl.PerfectLink
}

func (nnar *NnAtomicRegister) Handle(m *pb.Message, events chan *pb.Message) error {
	log.Println("[nnar] handling message")
	return nil
}
