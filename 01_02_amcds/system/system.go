package system

import (
	"strings"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/app"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/broadcast"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pl"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/register"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/util"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/util/log"
)

type Abstraction interface {
	Handle(m *pb.Message) error
}

type abstractionId = string
type abstractionRegistry = map[abstractionId]Abstraction

type System struct {
	systemId     string
	msgQueue     chan *pb.Message
	abstractions abstractionRegistry
	hubAddress   string
	ownProcess   *pb.ProcessId
	processes    []*pb.ProcessId
}

// StartEventLoop listens for messages in a goroutine
func (s *System) StartEventLoop() {
	go s.run()
}

func (s *System) run() {
	for m := range s.msgQueue {
		handler, ok := s.abstractions[m.ToAbstractionId]

		if !ok {
			log.Info("Registering abstractions for %v", m.ToAbstractionId)
			if strings.Contains(m.ToAbstractionId, "nnar") {
				s.registerNnarAbstractions(util.GetRegisterId((m.ToAbstractionId)))
			}
		}

		handler, ok = s.abstractions[m.ToAbstractionId]
		if !ok {
			log.Warn("No handler defined for %v", m.Type)
			continue
		}

		log.Debug("["+m.ToAbstractionId+"] "+"handling message %v", m.Type)
		err := handler.Handle(m)
		if err != nil {
			log.Error("Failed to handle the message %v", err)
		}
	}
}

// RegisterAbstractions creates the initial abstractions such as `app` and `beb``
func (s *System) RegisterAbstractions() {
	pl := pl.Create(s.ownProcess.Host, s.ownProcess.Port, s.hubAddress).WithProps(s.systemId, s.msgQueue, s.processes)

	s.abstractions["app"] = &app.App{MsgQueue: s.msgQueue}
	s.abstractions["app.pl"] = pl.CopyWithParentId("app")

	s.abstractions["app.beb"] = broadcast.Create(s.msgQueue, s.processes, "app.beb")
	s.abstractions["app.beb.pl"] = pl.CopyWithParentId("app.beb")
}

func (s *System) Destroy() {
	log.Debug("Destroying system %v", s.systemId)
	close(s.msgQueue)
}

// AddMessage adds the given message to the queue (channel)
func (s *System) AddMessage(m *pb.Message) {
	log.Debug("Received message for %v with type %v", m.ToAbstractionId, m.Type)
	s.msgQueue <- m
}

func CreateSystem(m *pb.Message, host, owner, hubAddress string, port, index int32) *System {
	log.Debug("Creating system %v", m.SystemId)
	var ownProcess *pb.ProcessId
	for _, p := range m.ProcInitializeSystem.Processes {
		if p.Owner == owner && p.Index == index {
			ownProcess = p
		}
	}
	return &System{
		systemId:     m.SystemId,
		msgQueue:     make(chan *pb.Message, 4096),
		ownProcess:   ownProcess,
		hubAddress:   hubAddress,
		abstractions: make(map[string]Abstraction),
		processes:    m.ProcInitializeSystem.Processes,
	}
}

func (s *System) registerNnarAbstractions(key string) {
	pl := pl.Create(s.ownProcess.Host, s.ownProcess.Port, s.hubAddress).WithProps(s.systemId, s.msgQueue, s.processes)
	aId := "app.nnar[" + key + "]"

	s.abstractions[aId] = &register.NnAtomicRegister{
		MsgQueue:   s.msgQueue,
		N:          int32(len(s.processes)),
		Key:        key,
		Timestamp:  0,
		WriterRank: s.ownProcess.Rank,
		Value:      -1,
		ReadList:   make(map[int32]*pb.NnarInternalValue),
	}
	s.abstractions[aId+".pl"] = pl.CopyWithParentId(aId)
	s.abstractions[aId+".beb"] = broadcast.Create(s.msgQueue, s.processes, aId+".beb")
	s.abstractions[aId+".beb.pl"] = pl.CopyWithParentId(aId + ".beb")
}
