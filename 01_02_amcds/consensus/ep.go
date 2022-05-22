package consensus

import (
	"errors"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/util"
)

type EpState struct {
	ValTs int32
	Value *pb.Value
}

type EpochConsensus struct {
	id        string
	parentId  string
	msgQueue  chan *pb.Message
	processes []*pb.ProcessId
	aborted   bool
	ets       int32
	state     *EpState
	tmpVal    *pb.Value
	states    map[string]*EpState
	accepted  int
}

func CreateEp(parentAbstraction, abstractionId string, mQ chan *pb.Message, processes []*pb.ProcessId, ets int32, state *EpState) *EpochConsensus {
	return &EpochConsensus{
		id:        abstractionId,
		parentId:  parentAbstraction,
		msgQueue:  mQ,
		processes: processes,
		aborted:   false,
		ets:       ets,
		state:     state,
		tmpVal:    &pb.Value{},
		states:    make(map[string]*EpState),
		accepted:  0,
	}
}

func (ep *EpochConsensus) Handle(m *pb.Message) error {
	if ep.aborted {
		return nil
	}

	switch m.Type {
	case pb.Message_EP_PROPOSE:
		// upon event ⟨ ep, Propose | v ⟩ do
		ep.tmpVal = m.EpPropose.Value
		ep.msgQueue <- &pb.Message{
			Type:              pb.Message_BEB_BROADCAST,
			FromAbstractionId: ep.id,
			ToAbstractionId:   ep.id + ".beb",
			BebBroadcast: &pb.BebBroadcast{
				Message: &pb.Message{
					Type:              pb.Message_EP_INTERNAL_READ,
					FromAbstractionId: ep.id,
					ToAbstractionId:   ep.id,
					EpInternalRead:    &pb.EpInternalRead{},
				},
			},
		}
	case pb.Message_PL_DELIVER:
		switch m.PlDeliver.Message.Type {
		case pb.Message_EP_INTERNAL_STATE:
			// upon event ⟨ pl, Deliver | q, [STATE, ts, v] ⟩ do
			ep.states[util.GetProcessKey(m.PlDeliver.Sender)] = &EpState{
				ValTs: m.PlDeliver.Message.EpInternalState.ValueTimestamp,
				Value: m.PlDeliver.Message.EpInternalState.Value,
			}

			// upon #(states) > N/2 do
			if len(ep.states) > len(ep.processes)/2 {
				hS := ep.highest()
				if hS != nil && hS.Value != nil && hS.Value.Defined {
					ep.tmpVal = hS.Value
				}
				ep.states = make(map[string]*EpState)

				ep.msgQueue <- &pb.Message{
					Type:              pb.Message_BEB_BROADCAST,
					FromAbstractionId: ep.id,
					ToAbstractionId:   ep.id + ".beb",
					BebBroadcast: &pb.BebBroadcast{
						Message: &pb.Message{
							Type:              pb.Message_EP_INTERNAL_WRITE,
							FromAbstractionId: ep.id,
							ToAbstractionId:   ep.id,
							EpInternalWrite: &pb.EpInternalWrite{
								Value: ep.tmpVal,
							},
						},
					},
				}
			}
		case pb.Message_EP_INTERNAL_ACCEPT:
			// upon event ⟨ pl, Deliver | q, [ACCEPT] ⟩ do
			ep.accepted = ep.accepted + 1
			if ep.accepted > len(ep.processes)/2 {
				// upon accepted > N/2 do
				ep.accepted = 0
				ep.msgQueue <- &pb.Message{
					Type:              pb.Message_BEB_BROADCAST,
					FromAbstractionId: ep.id,
					ToAbstractionId:   ep.id + ".beb",
					BebBroadcast: &pb.BebBroadcast{
						Message: &pb.Message{
							Type:              pb.Message_EP_INTERNAL_DECIDED,
							FromAbstractionId: ep.id,
							ToAbstractionId:   ep.id,
							EpInternalDecided: &pb.EpInternalDecided{
								Value: ep.tmpVal,
							},
						},
					},
				}
			}
		default:
			return errors.New("Message not supported")
		}
	case pb.Message_BEB_DELIVER:
		switch m.BebDeliver.Message.Type {
		case pb.Message_EP_INTERNAL_READ:
			// upon event ⟨ beb, Deliver | l, [READ] ⟩ do
			ep.msgQueue <- &pb.Message{
				Type:              pb.Message_PL_SEND,
				FromAbstractionId: ep.id,
				ToAbstractionId:   ep.id + ".pl",
				PlSend: &pb.PlSend{
					Destination: m.BebDeliver.Sender,
					Message: &pb.Message{
						Type:              pb.Message_EP_INTERNAL_STATE,
						FromAbstractionId: ep.id,
						ToAbstractionId:   ep.id,
						EpInternalState: &pb.EpInternalState{
							ValueTimestamp: ep.state.ValTs,
							Value:          ep.state.Value,
						},
					},
				},
			}
		case pb.Message_EP_INTERNAL_WRITE:
			// upon event ⟨ beb, Deliver | l, [WRITE, v] ⟩ do
			ep.state.ValTs = ep.ets
			ep.state.Value = m.BebDeliver.Message.EpInternalWrite.Value
			ep.msgQueue <- &pb.Message{
				Type:              pb.Message_PL_SEND,
				FromAbstractionId: ep.id,
				ToAbstractionId:   ep.id + ".pl",
				PlSend: &pb.PlSend{
					Destination: m.BebDeliver.Sender,
					Message: &pb.Message{
						Type:              pb.Message_EP_INTERNAL_ACCEPT,
						FromAbstractionId: ep.id,
						ToAbstractionId:   ep.id,
						EpInternalAccept:  &pb.EpInternalAccept{},
					},
				},
			}
		case pb.Message_EP_INTERNAL_DECIDED:
			// upon event ⟨ beb, Deliver | l, [DECIDED, v] ⟩ do
			ep.msgQueue <- &pb.Message{
				Type:              pb.Message_EP_DECIDE,
				FromAbstractionId: ep.id,
				ToAbstractionId:   ep.parentId,
				EpDecide: &pb.EpDecide{
					Ets:   ep.ets,
					Value: ep.state.Value,
				},
			}
		default:
			return errors.New("Message not supported")
		}
	case pb.Message_EP_ABORT:
		// upon event ⟨ ep, Abort ⟩ do
		ep.msgQueue <- &pb.Message{
			Type:              pb.Message_EP_ABORTED,
			FromAbstractionId: ep.id,
			ToAbstractionId:   ep.parentId,
			EpAborted: &pb.EpAborted{
				Ets:            ep.ets,
				ValueTimestamp: ep.state.ValTs,
				Value:          ep.state.Value,
			},
		}
		ep.aborted = true
	default:
		return errors.New("Message not supported")
	}

	return nil
}

func (ep *EpochConsensus) Destroy() {}

func (ep *EpochConsensus) highest() *EpState {
	state := &EpState{}
	for _, v := range ep.states {
		if v.ValTs > state.ValTs {
			state = v
		}
	}
	return state
}
