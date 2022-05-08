package consensus

import (
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/util/log"
)

type EpochChange struct{}

func (ep *EpochChange) Handle(m *pb.Message) error {
	log.Debug("[ec] handling message")
	return nil
}
