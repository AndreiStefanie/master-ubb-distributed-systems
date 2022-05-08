package consensus

import (
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/util/log"
)

type UniformConsensus struct{}

func (ep *UniformConsensus) Handle(m *pb.Message) error {
	log.Debug("[uc] handling message")
	return nil
}
