package pl

import (
	"errors"
	"net"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/infra"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/util"
	"google.golang.org/protobuf/proto"
)

type PerfectLink struct {
	host       string
	port       int32
	hubAddress string
	msgQueue   chan *pb.Message
	systemId   string
	parentId   string
	processes  []*pb.ProcessId
}

func Create(host string, port int32, hubAddress string) *PerfectLink {
	return &PerfectLink{
		host:       host,
		port:       port,
		hubAddress: hubAddress,
	}
}

func (pl *PerfectLink) WithProps(systemId string, msgQueue chan *pb.Message, ps []*pb.ProcessId) *PerfectLink {
	pl.systemId = systemId
	pl.msgQueue = msgQueue
	pl.processes = ps

	return pl
}

func (pl PerfectLink) CopyWithParentId(parentAbstraction string) *PerfectLink {
	newPl := pl
	newPl.parentId = parentAbstraction

	return &newPl
}

func (pl *PerfectLink) Handle(m *pb.Message) error {
	switch m.Type {
	case pb.Message_NETWORK_MESSAGE:
		var sender *pb.ProcessId
		for _, p := range pl.processes {
			if p.Host == m.NetworkMessage.SenderHost && p.Port == m.NetworkMessage.SenderListeningPort {
				sender = p
			}
		}
		msg := &pb.Message{
			SystemId:          m.SystemId,
			FromAbstractionId: m.ToAbstractionId,
			ToAbstractionId:   pl.parentId,
			Type:              pb.Message_PL_DELIVER,
			PlDeliver: &pb.PlDeliver{
				Sender:  sender,
				Message: m.NetworkMessage.Message,
			},
		}
		pl.msgQueue <- msg
	case pb.Message_PL_SEND:
		return pl.Send(m)
	default:
		return errors.New("Message not supported")
	}

	return nil
}

func (pl *PerfectLink) Send(m *pb.Message) error {
	mToSend := &pb.Message{
		SystemId:        pl.systemId,
		ToAbstractionId: m.ToAbstractionId,
		Type:            pb.Message_NETWORK_MESSAGE,
		NetworkMessage: &pb.NetworkMessage{
			Message:             m.PlSend.Message,
			SenderHost:          pl.host,
			SenderListeningPort: pl.port,
		},
	}

	data, err := proto.Marshal(mToSend)
	if err != nil {
		return err
	}

	address := pl.hubAddress
	if m.PlSend.Destination != nil {
		address = net.JoinHostPort(m.PlSend.Destination.Host, util.Int32ToString(m.PlSend.Destination.Port))
	}

	return infra.Send(address, data)
}

func (pl *PerfectLink) Parse(data []byte) (*pb.Message, error) {
	m := &pb.Message{}
	err := proto.Unmarshal(data, m)
	if err != nil {
		return nil, err
	}

	return m, nil
}

func (pl *PerfectLink) Destroy() {}
