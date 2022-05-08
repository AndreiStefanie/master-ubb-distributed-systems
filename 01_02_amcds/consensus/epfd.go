package consensus

import (
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/util/log"
)

type EventuallyPerfectFailureDetector struct{}

func (epfd *EventuallyPerfectFailureDetector) Handle(m *pb.Message) error {
	log.Debug("[epfd] handling message")
	return nil
}
