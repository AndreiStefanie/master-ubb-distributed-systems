#!/bin/bash

SRC_DIR=proto
SERVER_DIR=server
CLIENT_DIR=client

# Generate the Go files
protoc --go_out=$SERVER_DIR $SRC_DIR/neobank.proto

# Generate the TS files
protoc-gen-grpc-ts \
  --ts_out=grpc_js:$CLIENT_DIR/proto \
  --proto_path $SRC_DIR \
  $SRC_DIR/neobank.proto
