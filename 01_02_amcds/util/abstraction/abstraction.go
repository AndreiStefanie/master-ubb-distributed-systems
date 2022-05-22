package abstraction

import "github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/pb"

type Abstraction interface {
	Handle(m *pb.Message) error
	Destroy()
}

type Registry = map[string]Abstraction
