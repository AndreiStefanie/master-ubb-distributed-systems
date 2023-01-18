# MFPC Project

This project illustrates concurrency control models for databases. It implements [MVCC](https://en.wikipedia.org/wiki/Multiversion_concurrency_control) (also see [Postgres docs](https://www.postgresql.org/docs/current/mvcc-intro.html)) for transactions spanning multiple databases.

## Business Requirements

The project implements a minimal neo bank with the following features:

- Each user has a unique user name and must authenticate
- Each user can deposit and withdraw money
- Each user can lend money to other users
- Each operation must be recorded in the audit log

## Running the system

### Infra

In the [infra](./infra/) directory, for each subdirectory, copy the `.env.dist` file to `.env` and set strong passwords. These will be set for the databases during the initial setup.

```bash
docker-compose up -d
```

### Server

### Client

## Technical aspects

The system will use two database management systems:

- [PostgreSQL](https://www.postgresql.org/) for the users, account data (balances), and the audit log
- [Neo4j](https://neo4j.com/) for the lending graph

The architecture is client-server based on [gRPC](https://grpc.io/). The authentication is based on [TLS certificates](https://grpc.io/docs/guides/auth/#with-server-authentication-ssltls).

### Server

The server is written in [Go](https://go.dev/) mainly for its [goroutines](https://go.dev/tour/concurrency/1) which enable us to spawn a new lightweight thread for each request. The gRPC server does this out of the box ([link](https://github.com/grpc/grpc-go/blob/master/Documentation/concurrency.md#servers)).

### Client

The client application is a CLI program written in Typescript/Node.js (it can be any other language [supported by gRPC](https://grpc.io/docs/languages/))

## Concurrency control

> Postgres uses by default [Read Committed Isolation Level](https://www.postgresql.org/docs/current/transaction-iso.html#XACT-READ-COMMITTED) which

The concurrency control model is MVCC and is implemented as follows:

- Each transaction is identified by an ID - `txid`. This is a monotonically increasing sequence number ~~managed by [Redis](https://redis.io/) with [AOF](https://redis.io/docs/management/persistence/#append-only-file) enabled and `fsync` for every operation. Redis was chosen for being single threaded and for offering an [atomic operation](https://redis.io/commands/incr/) for this use case~~
- Each transaction is stored in the `mvcc.transactions` table in Postgres. (txid, timestamp, status). The `txid` is based on the `GENERATED AS IDENTITY` feature of [CREATE TABLE](https://www.postgresql.org/docs/15/sql-createtable.html).
- Each data record (row in Postgres and node in Neo4j) contains `txid_min`, `txid_max`
- `txid_min` indicates the transaction that created the row
- `txid_max` indicates the transaction that deleted the row. `UPDATE` also counts as deletion since a new row (version) is created.

### Deadlocks

While the MVCC model is less prone to deadlocks, they can still occur for write transactions. The system periodically checks the [wait-for](https://en.wikipedia.org/wiki/Wait-for_graph) graph stored in Neo4j. If it finds any deadlock, the system aborts the latest transaction (greatest `txid`).
