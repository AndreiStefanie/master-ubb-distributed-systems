package consensus

import (
	"log"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pl"
)

type EpochConsensus struct {
	pl *pl.PerfectLink
}

func (ep *EpochConsensus) Handle(m *pb.Message, events chan *pb.Message) error {
	log.Println("[ep] handling message")
	return nil
}
