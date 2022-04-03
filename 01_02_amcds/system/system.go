package system

import "github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"

type Abstraction interface {
	Handle(m *pb.Message, events chan *pb.Message) error
}

type System struct {
	SystemId string
	Events   []pb.Message
	Process  *pb.ProcessId
}

func (s *System) CreateQueue() error {
	s.Events = make([]pb.Message, 100)
	return nil
}

func (s *System) StartEventLoop() error {
	return nil
}

func (s *System) RegisterAbstractions() error {
	return nil
}

func CreateSystem(systemId, host, owner string, port, index, rank int32) *System {
	return &System{
		SystemId: systemId,
		Events:   []pb.Message{},
		Process: &pb.ProcessId{
			Host:  host,
			Port:  port,
			Owner: owner,
			Index: index,
			Rank:  rank,
		},
	}
}
