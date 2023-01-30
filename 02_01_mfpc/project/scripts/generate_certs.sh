#!/bin/bash

CERT_DIR=cert

# Generate the CA certificate and private key
openssl req -x509 \
  -newkey rsa:4096 -days 365 -nodes \
  -keyout $CERT_DIR/ca-key.pem \
  -out $CERT_DIR/ca-cert.pem \
  -subj "/C=RO/CN=localhost"

# Generate the server key and CSR
openssl req -newkey rsa:4096 -nodes \
  -keyout $CERT_DIR/server-key.pem \
  -out $CERT_DIR/server-req.pem \
  -subj "/C=RO/CN=localhost"

# Sign the server CSR with the CA private key
openssl x509 -req -in $CERT_DIR/server-req.pem \
  -days 60 \
  -CA $CERT_DIR/ca-cert.pem -CAkey $CERT_DIR/ca-key.pem -CAcreateserial \
  -out $CERT_DIR/server-cert.pem \
  -extfile $CERT_DIR/server-ext.cnf
