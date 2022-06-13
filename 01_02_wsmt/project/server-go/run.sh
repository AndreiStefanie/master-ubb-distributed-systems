#!/bin/sh
nodemon -e go --signal SIGTERM --exec 'go' run .
