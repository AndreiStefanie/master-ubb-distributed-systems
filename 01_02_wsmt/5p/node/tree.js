#!/usr/bin/env node
const fs = require('fs').promises;

class BSTNode {
  constructor(id, value) {
    this.id = id;
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

/**
 * Traverses the BST, starting from the given node, in post-order
 * @param {BSTNode} node
 * @param {Function} handler
 */
function postOrder(node, handler) {
  if (node.left) {
    postOrder(node.left, handler);
  }

  if (node.right) {
    postOrder(node.right, handler);
  }

  return handler(node);
}

async function main(path) {
  try {
    // Extract the data from the input file
    const rawInput = await fs.readFile(path);
    const inputNodes = Array.from(JSON.parse(rawInput));

    // Transform the data to the internal BST representation
    // The first iteration creates the nodes without linking the children
    const nodes = inputNodes
      .map((inputNode) => new BSTNode(inputNode.id, inputNode.value))
      .reduce((acc, node) => ({ ...acc, [node.id]: node }), {});

    // The second iteration adds the relationships between nodes
    let root;
    for (const inputNode of inputNodes) {
      if (inputNode.parent === null) {
        root = nodes[inputNode.id];
        // Nothing to do for the root input node
        continue;
      }

      const parentNode = nodes[inputNode.parent];
      const currentNode = nodes[inputNode.id];
      if (inputNode.right) {
        parentNode.right = currentNode;
      } else {
        parentNode.left = currentNode;
      }
    }

    if (!root) {
      console.error('No root node provided');
      return;
    }

    // Load/handle the BST - in this case simply print the node values
    postOrder(root, (node) => console.log(node.value));
  } catch (error) {
    console.error(error);
  }
}

const args = process.argv.slice(2);

if (args.length !== 1) {
  console.error(`Usage: ./tree.js <path_to_input_file>`);
  process.exit(1);
}

main(args[0]);
