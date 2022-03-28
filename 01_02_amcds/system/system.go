package system

import "github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/message"

type Abstraction interface {
	Handle() error
}

type System struct {
	Events    []message.Message
	SystemId  string
	Processes map[string]message.ProcessId
}
