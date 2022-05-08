# AMCDS Project

This project implements the algorithms described in the following [specification](http://www.cs.ubbcluj.ro/~rares/course/amcds/res/communication-protocol.proto).

## Getting Started

### Building the binary

```bash
go build -o amcds .
```

### Running the program

```bash
./amcds -owner sap -hub 127.0.0.1:5000 -port 5004 -index 1
```

All arguments are optional. If they are no provided, the values from the command from above are used.

## Open Issues

- Inform the hub about process termination
