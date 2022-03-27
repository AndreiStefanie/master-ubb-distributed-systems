#!/usr/bin/env php
<?php

class BSTNode
{
  public int $id;
  public string $value;
  public ?BSTNode $left;
  public ?BSTNode $right;

  public function __construct(int $id, string $value)
  {
    $this->id = $id;
    $this->value = $value;
    $this->left = null;
    $this->right = null;
  }
}

function postOrder($node, $handler)
{
  if (!$node) {
    return;
  }

  postOrder($node->left, $handler);

  postOrder($node->right, $handler);

  $handler($node);
}

if ($argc != 2) {
  print_r('Usage: php ./tree.php <path_to_input_file>');
  exit(1);
}

// Extract the data from the input file
$rawInput = file_get_contents($argv[1]);
$inputNodes = json_decode($rawInput, true);

// Transform the data to the internal BST representation
// The first iteration creates the nodes without linking the children
$nodes = [];
foreach ($inputNodes as $inputNode) {
  $nodes[$inputNode['id']] = new BSTNode($inputNode['id'], $inputNode['value']);
}

// The second iteration adds the relationships between nodes
$root;
foreach ($inputNodes as $inputNode) {
  if (is_null($inputNode['parent'])) {
    $root = $nodes[$inputNode['id']];
    continue;
  }

  $parentNode = $nodes[$inputNode['parent']];
  $currentNode = $nodes[$inputNode['id']];
  if ($inputNode['right']) {
    $parentNode->right = $currentNode;
  } else {
    $parentNode->left = $currentNode;
  }
}

if (!$root) {
  print_r('No root node provided');
  exit(1);
}

// Load/handle the BST - in this case simply print the node values
postOrder($root, function ($node) {
  echo $node->value . "\n";
});
