package infra

import (
	"bufio"
	"encoding/binary"
	"io"
	"net"

	"github.com/AndreiStefanie/master-ubb-distributed-systems/amcds/util/log"
)

func Send(address string, data []byte) error {
	c, err := net.Dial("tcp", address)
	if err != nil {
		return err
	}
	defer c.Close()

	// Add the size of the data as the first 4 bytes
	b := make([]byte, 4)
	binary.BigEndian.PutUint32(b, uint32(len(data)))

	_, err = c.Write(append(b, data...))

	return err
}

type Handler func(data []byte)

func Listen(address string, handler Handler) (net.Listener, error) {
	l, err := net.Listen("tcp", address)
	if err != nil {
		return nil, err
	}
	go func(handler Handler) {
		for {
			// Handle the connection in a function so the closing can be defered
			func() {
				c, err := l.Accept()
				if err != nil {
					return
				}
				defer c.Close()

				reader := bufio.NewReader(c)

				// The first 4 bytes indicate the size of the data
				sizeBuf := make([]byte, 4)
				_, err = io.ReadFull(reader, sizeBuf)
				if err != nil {
					log.Warn("Failed to read the size of the message %v", err)
					return
				}

				dataBuf := make([]byte, binary.BigEndian.Uint32(sizeBuf))
				_, err = io.ReadFull(reader, dataBuf)
				if err != nil {
					log.Warn("Failed to read the content of the message %v", err)
					return
				}

				handler(dataBuf)
			}()
		}
	}(handler)

	return l, nil
}
