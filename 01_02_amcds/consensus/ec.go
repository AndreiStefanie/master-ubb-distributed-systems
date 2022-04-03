package consensus

import (
	"log"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pl"
)

type EpochChange struct {
	pl *pl.PerfectLink
}

func (ep *EpochChange) Handle(m *pb.Message, events chan *pb.Message) error {
	log.Println("[ec] handling message")
	return nil
}
