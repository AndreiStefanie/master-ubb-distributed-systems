package mvcc

import (
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

func (tx *Transaction) createTxNode() error {
	session := tx.neoConn.NewSession(neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close()

	_, err := session.WriteTransaction(func(neoTx neo4j.Transaction) (interface{}, error) {
		tRes, err := neoTx.Run(
			`CREATE (tx:Transaction) 
				SET tx.id = $txid, tx.createdAt = $createdAt, tx.status = $status
				RETURN id(tx)`,
			map[string]any{"txid": tx.ID, "createdAt": tx.CreatedAt.UTC(), "status": tx.Status},
		)
		if err != nil {
			return nil, err
		}

		return tRes.Consume()
	})
	if err != nil {
		return err
	}

	return nil
}

func (tx *Transaction) deleteTxNodes() error {
	session := tx.neoConn.NewSession(neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close()

	_, err := session.WriteTransaction(func(neoTx neo4j.Transaction) (interface{}, error) {
		tRes, err := neoTx.Run(
			`MATCH (tx:Transaction {id: ${txid}}) DETACH DELETE tx`,
			map[string]any{"txid": tx.ID},
		)
		if err != nil {
			return nil, err
		}

		return tRes.Consume()
	})
	if err != nil {
		return err
	}

	return nil
}

func (tx *Transaction) addResourceDependency(table string, id int) error {
	session := tx.neoConn.NewSession(neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close()

	_, err := session.WriteTransaction(func(neoTx neo4j.Transaction) (interface{}, error) {
		tRes, err := neoTx.Run(
			`MATCH (tx:Transaction {id: $txid})
				MERGE (r:Resource {table: $table, id: $id})
				MERGE (tx)-[:NEEDS]->(r)
				RETURN id(r)`,
			map[string]any{"txid": tx.ID, "table": table, "id": id},
		)
		if err != nil {
			return nil, err
		}

		return tRes.Consume()
	})
	if err != nil {
		return err
	}

	return nil
}

func (tx *Transaction) addResourceLock(table string, id int) error {
	session := tx.neoConn.NewSession(neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close()

	_, err := session.WriteTransaction(func(neoTx neo4j.Transaction) (interface{}, error) {
		tRes, err := neoTx.Run(
			`MATCH (tx:Transaction {id: $txid})
			 MATCH (r:Resource {table: $table, id: $id})
				MERGE (r)-[:LOCKED_BY]->(tx)
				RETURN id(r)`,
			map[string]any{"txid": tx.ID, "table": table, "id": id},
		)
		if err != nil {
			return nil, err
		}

		return tRes.Consume()
	})
	if err != nil {
		return err
	}

	return nil
}
