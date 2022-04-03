package consensus

import (
	"log"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
)

type EventualLeaderDetector struct {
	epfd *EventuallyPerfectFailureDetector
}

func (ep *EventualLeaderDetector) Handle(m *pb.Message, events chan *pb.Message) error {
	log.Println("[eld] handling message")
	return nil
}
