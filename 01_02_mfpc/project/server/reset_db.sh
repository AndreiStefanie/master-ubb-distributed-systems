#!/bin/bash

MVCC_URL='postgres://postgres:pass1234@localhost:5432/mvcc?sslmode=disable'
APP_URL='postgres://postgres:pass1234@localhost:5432/neobank?sslmode=disable'

yes | migrate -database ${MVCC_URL} -path db/migrations/mvcc down
yes | migrate -database ${MVCC_URL} -path db/migrations/mvcc up

yes | migrate -database ${APP_URL} -path db/migrations/app down
yes | migrate -database ${APP_URL} -path db/migrations/app up
