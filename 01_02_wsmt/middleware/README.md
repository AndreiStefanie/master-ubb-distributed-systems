# Middleware Miniapp

This project implements a library management system. It allows its users to perform CRUD operations on authors and books.

## Server

The server is based on Pyro4 and is written in Python (python 3.9).

### Database

The database is MySQL (8.0.29) and the server interacts with it through the `peewee` ORM.

#### Connecting to the database

To run the server you have to set the `DATABASE` environment variable that instructs the server on how to connect to the database. E.g. `export DATABASE="mysql://root:pass@localhost:3306/library"`. If you don't provide this, the server will use a SQLite database with file named `default.db`.

## Clients

The clients

### Python (Pyro4)

### C# (Pyrolite)

### Java (Pyrolite)
