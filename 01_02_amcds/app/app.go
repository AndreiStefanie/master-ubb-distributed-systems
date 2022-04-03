package app

import (
	"log"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/broadcast"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"
	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pl"
)

type App struct {
	pl  *pl.PerfectLink
	beb *broadcast.BestEffortBroadcast
}

func (app *App) Handle(m *pb.Message, events chan *pb.Message) error {
	log.Println("[app] handling message")
	return nil
}
