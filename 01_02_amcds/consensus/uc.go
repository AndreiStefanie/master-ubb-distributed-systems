package consensus

import (
	"log"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pl"
)

type UniformConsensus struct {
	pl *pl.PerfectLink
}

func (ep *UniformConsensus) Handle(m *pb.Message, events chan *pb.Message) error {
	log.Println("[uc] handling message")
	return nil
}
