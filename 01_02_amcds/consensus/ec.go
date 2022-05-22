package consensus

import (
	"errors"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/util"
)

type EpochChange struct {
	id        string
	parentId  string
	self      *pb.ProcessId
	msgQueue  chan *pb.Message
	processes []*pb.ProcessId
	trusted   *pb.ProcessId
	lastTs    int32
	ts        int32
}

func CreateEc(parentAbstraction, abstractionId string, ownProcess *pb.ProcessId, mQ chan *pb.Message, processes []*pb.ProcessId) *EpochChange {
	return &EpochChange{
		id:        abstractionId,
		parentId:  parentAbstraction,
		self:      ownProcess,
		processes: processes,
		msgQueue:  mQ,
		trusted:   util.GetMaxRankSlice(processes),
		lastTs:    0,
		ts:        ownProcess.Rank,
	}
}

func (ec *EpochChange) Handle(m *pb.Message) error {
	switch m.Type {
	case pb.Message_ELD_TRUST:
		ec.trusted = m.EldTrust.Process
		ec.handleSelfTrusted()
	case pb.Message_PL_DELIVER:
		switch m.PlDeliver.Message.Type {
		case pb.Message_EC_INTERNAL_NACK:
			ec.handleSelfTrusted()
		default:
			return errors.New("Message not supported")
		}
	case pb.Message_BEB_DELIVER:
		switch m.BebDeliver.Message.Type {
		case pb.Message_EC_INTERNAL_NEW_EPOCH:
			newTs := m.BebDeliver.Message.EcInternalNewEpoch.Timestamp
			l := util.GetProcessKey(m.BebDeliver.Sender)
			trusted := util.GetProcessKey(ec.trusted)
			if l == trusted && newTs > ec.lastTs {
				ec.lastTs = newTs
				ec.msgQueue <- &pb.Message{
					Type:              pb.Message_EC_START_EPOCH,
					FromAbstractionId: ec.id,
					ToAbstractionId:   ec.parentId,
					EcStartEpoch: &pb.EcStartEpoch{
						NewTimestamp: newTs,
						NewLeader:    m.BebDeliver.Sender,
					},
				}
			} else {
				ec.msgQueue <- &pb.Message{
					Type:              pb.Message_PL_SEND,
					FromAbstractionId: ec.id,
					ToAbstractionId:   ec.id + ".pl",
					PlSend: &pb.PlSend{
						Destination: m.BebDeliver.Sender,
						Message: &pb.Message{
							Type:              pb.Message_EC_INTERNAL_NACK,
							FromAbstractionId: ec.id,
							ToAbstractionId:   ec.id,
							EcInternalNack:    &pb.EcInternalNack{},
						},
					},
				}
			}
		default:
			return errors.New("Message not supported")
		}
	default:
		return errors.New("Message not supported")
	}

	return nil
}

func (ec *EpochChange) handleSelfTrusted() {
	if util.GetProcessKey(ec.self) == util.GetProcessKey(ec.trusted) {
		ec.ts = ec.ts + int32(len(ec.processes))
		ec.msgQueue <- &pb.Message{
			Type:              pb.Message_BEB_BROADCAST,
			FromAbstractionId: ec.id,
			ToAbstractionId:   ec.id + ".beb",
			BebBroadcast: &pb.BebBroadcast{
				Message: &pb.Message{
					Type:              pb.Message_EC_INTERNAL_NEW_EPOCH,
					FromAbstractionId: ec.id,
					ToAbstractionId:   ec.id,
					EcInternalNewEpoch: &pb.EcInternalNewEpoch{
						Timestamp: ec.ts,
					},
				},
			},
		}
	}
}

func (ec *EpochChange) Destroy() {}
