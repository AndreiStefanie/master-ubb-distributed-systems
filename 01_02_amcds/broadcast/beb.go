package broadcast

import (
	"log"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pl"
)

type BestEffortBroadcast struct {
	pl *pl.PerfectLink
}

func (beb *BestEffortBroadcast) Handle(m *pb.Message, events chan *pb.Message) error {
	log.Println("[beb] handling message")
	return nil
}
