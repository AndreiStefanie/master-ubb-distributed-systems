package consensus

import (
	"log"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pl"
)

type EventuallyPerfectFailureDetector struct {
	pl *pl.PerfectLink
}

func (epfd *EventuallyPerfectFailureDetector) Handle(m *pb.Message, events chan *pb.Message) error {
	log.Println("[epfd] handling message")
	return nil
}
