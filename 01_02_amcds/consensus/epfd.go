package consensus

import (
	"errors"
	"time"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/util"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/util/log"
)

const delta = 100 * time.Millisecond

type EventuallyPerfectFailureDetector struct {
	id        string
	parentId  string
	msgQueue  chan *pb.Message
	processes []*pb.ProcessId

	alive     util.ProcessMap
	suspected util.ProcessMap
	delay     time.Duration
	timer     *time.Timer
}

func CreateEpfd(parentAbstraction, abstractionId string, mQ chan *pb.Message, processes []*pb.ProcessId) *EventuallyPerfectFailureDetector {
	d := &EventuallyPerfectFailureDetector{
		id:        abstractionId,
		parentId:  parentAbstraction,
		msgQueue:  mQ,
		processes: processes,

		alive:     make(util.ProcessMap),
		suspected: make(util.ProcessMap),
		delay:     delta,
	}

	// Set all processes as alive
	for _, p := range processes {
		d.alive[util.GetProcessKey(p)] = p
	}

	d.startTimer(d.delay)

	return d
}

func (d *EventuallyPerfectFailureDetector) startTimer(delay time.Duration) {
	d.timer = time.NewTimer(delay)

	go timerCallback(d)
}

func timerCallback(d *EventuallyPerfectFailureDetector) {
	<-d.timer.C
	msgToSend := &pb.Message{
		Type:              pb.Message_EPFD_TIMEOUT,
		FromAbstractionId: d.id,
		ToAbstractionId:   d.id,
		EpfdTimeout:       &pb.EpfdTimeout{},
	}

	d.msgQueue <- msgToSend
}

func (d *EventuallyPerfectFailureDetector) Handle(m *pb.Message) error {
	switch m.Type {
	case pb.Message_EPFD_TIMEOUT:
		d.handleTimeout()
	case pb.Message_PL_DELIVER:
		switch m.PlDeliver.Message.Type {
		case pb.Message_EPFD_INTERNAL_HEARTBEAT_REQUEST:
			d.msgQueue <- &pb.Message{
				Type:              pb.Message_PL_SEND,
				FromAbstractionId: d.id,
				ToAbstractionId:   d.id + ".pl",
				PlSend: &pb.PlSend{
					Message: &pb.Message{
						Type:                       pb.Message_EPFD_INTERNAL_HEARTBEAT_REPLY,
						FromAbstractionId:          d.id,
						ToAbstractionId:            d.id,
						EpfdInternalHeartbeatReply: &pb.EpfdInternalHeartbeatReply{},
					},
				},
			}
		case pb.Message_EPFD_INTERNAL_HEARTBEAT_REPLY:
			d.alive[util.GetProcessKey(m.PlDeliver.Sender)] = m.PlDeliver.Sender
		default:
			return errors.New("Message not supported")
		}
	default:
		return errors.New("Message not supported")
	}

	return nil
}

// handleTimeout keeps the alive and suspected maps up to date and sends the heartbeat request
func (d *EventuallyPerfectFailureDetector) handleTimeout() {
	for k := range d.suspected {
		if _, ok := d.alive[k]; ok {
			d.delay = d.delay + delta
			log.Info("Increased timeout to %v", d.delay)
			break
		}
	}

	for _, p := range d.processes {
		key := util.GetProcessKey(p)
		_, isAlive := d.alive[key]
		_, isSuspected := d.suspected[key]

		if !isAlive && !isSuspected {
			d.suspected[key] = p

			d.msgQueue <- &pb.Message{
				Type:              pb.Message_EPFD_SUSPECT,
				FromAbstractionId: d.id,
				ToAbstractionId:   d.parentId,
				EpfdSuspect: &pb.EpfdSuspect{
					Process: p,
				},
			}
		} else if isAlive && isSuspected {
			delete(d.suspected, key)
			d.msgQueue <- &pb.Message{
				Type:              pb.Message_EPFD_RESTORE,
				FromAbstractionId: d.id,
				ToAbstractionId:   d.parentId,
				EpfdRestore: &pb.EpfdRestore{
					Process: p,
				},
			}
		}

		// Send heartbeat request
		d.msgQueue <- &pb.Message{
			Type:              pb.Message_PL_SEND,
			FromAbstractionId: d.id,
			ToAbstractionId:   d.id + ".pl",
			PlSend: &pb.PlSend{
				Destination: p,
				Message: &pb.Message{
					Type:                         pb.Message_EPFD_INTERNAL_HEARTBEAT_REQUEST,
					FromAbstractionId:            d.id,
					ToAbstractionId:              d.id,
					EpfdInternalHeartbeatRequest: &pb.EpfdInternalHeartbeatRequest{},
				},
			},
		}
	}

	d.alive = make(util.ProcessMap)
	d.startTimer(d.delay)
}

func (d *EventuallyPerfectFailureDetector) Destroy() {
	d.timer.Stop()
}
