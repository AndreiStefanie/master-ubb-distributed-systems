package main

import (
	"encoding/json"
	"fmt"
	"os"
)

type InputNode struct {
	Id     int    `json:"id"`
	Parent *int   `json:"parent"`
	Right  bool   `json:"right"`
	Value  string `json:"value"`
}

type BSTNode struct {
	id    int
	value string
	left  *BSTNode
	right *BSTNode
}

type NodeHandler func(*BSTNode)

func PostOrder(node *BSTNode, handler NodeHandler) {
	if node == nil {
		return
	}

	PostOrder(node.left, handler)

	PostOrder(node.right, handler)

	handler(node)
}

func main() {
	args := os.Args[1:]

	if len(args) != 1 {
		fmt.Println("Usage: tree <path_to_json_file>")
		return
	}

	// Extract the data from the input file
	rawInput, err := os.ReadFile(args[0])
	if err != nil {
		fmt.Println(err)
		return
	}

	var inputNodes []InputNode
	err = json.Unmarshal(rawInput, &inputNodes)
	if err != nil {
		fmt.Println(err)
		return
	}

	// Transform the data to the internal BST representation
	// The first iteration creates the nodes without linking the children
	nodes := make(map[int]*BSTNode)
	for _, inputNode := range inputNodes {
		nodes[inputNode.Id] = &BSTNode{
			id:    inputNode.Id,
			value: inputNode.Value,
		}
	}

	// The second iteration adds the relationships between nodes
	var root *BSTNode
	for _, inputNode := range inputNodes {
		if inputNode.Parent == nil {
			root = nodes[inputNode.Id]
			continue
		}

		parentNode := nodes[*inputNode.Parent]
		currentNode := nodes[inputNode.Id]
		if inputNode.Right {
			parentNode.right = currentNode
		} else {
			parentNode.left = currentNode
		}
	}

	if root == nil {
		fmt.Println("No root node provided")
		return
	}

	// Load/handle the BST - in this case simply print the node values
	PostOrder(root, func(node *BSTNode) { fmt.Println(node.value) })
}
