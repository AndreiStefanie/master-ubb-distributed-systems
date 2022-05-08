package consensus

import (
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/util/log"
)

type EpochConsensus struct{}

func (ep *EpochConsensus) Handle(m *pb.Message) error {
	log.Debug("[ep] handling message")
	return nil
}
