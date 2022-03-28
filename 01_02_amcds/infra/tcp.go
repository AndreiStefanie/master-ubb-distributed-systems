package infra

import (
	"bufio"
	"io"
	"net"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/message"
	"google.golang.org/protobuf/proto"
)

func Send(address string, m *message.Message) error {
	c, err := net.Dial("tcp", address)
	if err != nil {
		return err
	}
	defer c.Close()

	d, err := proto.Marshal(m)
	if err != nil {
		return err
	}

	_, err = c.Write(d)

	return err
}

type Handler func(data []byte)

func Listen(address string, handler Handler) error {
	l, err := net.Listen("tcp", address)
	if err != nil {
		return err
	}
	defer l.Close()

	for {
		c, err := l.Accept()
		if err != nil {
			return err
		}
		defer c.Close()
		data, err := io.ReadAll(bufio.NewReader(c))
		if err != nil {
			return err
		}
		handler(data)
	}
}
