package consensus

import (
	"errors"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/util"
)

type EventualLeaderDetector struct {
	id        string
	parentId  string
	msgQueue  chan *pb.Message
	processes []*pb.ProcessId
	alive     util.ProcessMap
	leader    *pb.ProcessId
}

func CreateEld(parentAbstraction, abstractionId string, mQ chan *pb.Message, processes []*pb.ProcessId) *EventualLeaderDetector {
	eld := &EventualLeaderDetector{
		id:        abstractionId,
		parentId:  parentAbstraction,
		msgQueue:  mQ,
		processes: processes,
		alive:     make(util.ProcessMap),
		leader:    nil,
	}

	// Set all processes as alive
	for _, p := range processes {
		eld.alive[util.GetProcessKey(p)] = p
	}

	return eld
}

func (eld *EventualLeaderDetector) Handle(m *pb.Message) error {
	switch m.Type {
	case pb.Message_EPFD_SUSPECT:
		key := util.GetProcessKey(m.EpfdSuspect.Process)
		if _, isAlive := eld.alive[key]; isAlive {
			delete(eld.alive, key)
		}
	case pb.Message_EPFD_RESTORE:
		eld.alive[util.GetProcessKey(m.EpfdRestore.Process)] = m.EpfdRestore.Process
	default:
		return errors.New("Message not supported")
	}

	return eld.updateLeader()
}

func (eld *EventualLeaderDetector) Destroy() {}

func (eld *EventualLeaderDetector) updateLeader() error {
	max := util.GetMaxRank(eld.alive)

	if max == nil {
		return errors.New("Could not determine the process with max rank")
	}

	if eld.leader == nil || util.GetProcessKey(eld.leader) != util.GetProcessKey(max) {
		eld.leader = max
		eld.msgQueue <- &pb.Message{
			Type:              pb.Message_ELD_TRUST,
			FromAbstractionId: eld.id,
			ToAbstractionId:   eld.parentId,
			EldTrust: &pb.EldTrust{
				Process: eld.leader,
			},
		}
	}

	return nil
}
