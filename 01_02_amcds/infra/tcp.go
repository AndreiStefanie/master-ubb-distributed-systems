package infra

import (
	"bufio"
	"encoding/binary"
	"io"
	"net"
)

func Send(address string, data []byte) error {
	c, err := net.Dial("tcp", address)
	if err != nil {
		return err
	}
	defer c.Close()

	// Add the size of the data as the first 4 bytes
	b := make([]byte, 4)
	binary.LittleEndian.PutUint32(b, uint32(len(data)))

	_, err = c.Write(append(b, data...))

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
		reader := bufio.NewReader(c)

		// The first 4 bytes indicate the size of the data
		sizeBuf := make([]byte, 4)
		_, err = io.ReadFull(reader, sizeBuf)
		if err != nil {
			return err
		}

		dataBuf := make([]byte, binary.LittleEndian.Uint32(sizeBuf))
		_, err = io.ReadFull(reader, dataBuf)
		if err != nil {
			return err
		}

		handler(dataBuf)
	}
}
