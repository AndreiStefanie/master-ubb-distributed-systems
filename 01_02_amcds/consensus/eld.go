package consensus

import (
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/util/log"
)

type EventualLeaderDetector struct{}

func (ep *EventualLeaderDetector) Handle(m *pb.Message) error {
	log.Debug("[eld] handling message")
	return nil
}
