package pl

import (
	"log"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/infra"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
	"google.golang.org/protobuf/proto"
)

type PerfectLink struct {
	Host string
	Port int32
}

func Create(host string, port int32) *PerfectLink {
	return &PerfectLink{
		Host: host,
		Port: port,
	}
}

func (pl *PerfectLink) Handle(m *pb.Message, events chan *pb.Message) error {
	log.Println("[pl] handling message")
	return nil
}

func (pl *PerfectLink) Send(address string, m *pb.Message) error {
	mToSend := &pb.Message{
		SystemId:        m.SystemId,
		ToAbstractionId: m.ToAbstractionId,
		Type:            pb.Message_NETWORK_MESSAGE,
		NetworkMessage: &pb.NetworkMessage{
			SenderListeningPort: pl.Port,
			Message:             m.PlSend.Message,
		},
	}

	data, err := proto.Marshal(mToSend)
	if err != nil {
		return err
	}

	return infra.Send(address, data)
}

func (pl *PerfectLink) Receive(data []byte, events chan *pb.Message) error {
	m := &pb.Message{}
	err := proto.Unmarshal(data, m)
	if err != nil {
		return err
	}

	events <- m

	return nil
}
