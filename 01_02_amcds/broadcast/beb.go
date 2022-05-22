package broadcast

import (
	"errors"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
)

type BestEffortBroadcast struct {
	msgQueue  chan *pb.Message
	processes []*pb.ProcessId
	id        string
}

func Create(queue chan *pb.Message, processes []*pb.ProcessId, id string) *BestEffortBroadcast {
	return &BestEffortBroadcast{
		msgQueue:  queue,
		processes: processes,
		id:        id,
	}
}

func (beb *BestEffortBroadcast) Handle(m *pb.Message) error {
	switch m.Type {
	case pb.Message_BEB_BROADCAST:
		for _, p := range beb.processes {
			msgToSend := &pb.Message{
				Type:              pb.Message_PL_SEND,
				FromAbstractionId: beb.id,
				ToAbstractionId:   beb.id + ".pl",
				PlSend: &pb.PlSend{
					Destination: p,
					Message:     m.BebBroadcast.Message,
				},
			}
			beb.msgQueue <- msgToSend
		}
	case pb.Message_PL_DELIVER:
		msgToSend := &pb.Message{
			Type:              pb.Message_BEB_DELIVER,
			FromAbstractionId: beb.id,
			ToAbstractionId:   m.PlDeliver.Message.ToAbstractionId,
			BebDeliver: &pb.BebDeliver{
				Sender:  m.PlDeliver.Sender,
				Message: m.PlDeliver.Message,
			},
		}
		beb.msgQueue <- msgToSend
	default:
		return errors.New("Message not supported")
	}

	return nil
}

func (beb *BestEffortBroadcast) Destroy() {}
