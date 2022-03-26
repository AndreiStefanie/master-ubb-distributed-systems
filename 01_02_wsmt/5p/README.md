# 5 Programs

This project provides the solution to an IO-related problem in 5 different languages. The implementations should be as similar as possible, such as similar naming conventions, similar patterns, and similar input and output.

## Requirements

**Post-order binary tree traversal**. The tree is specified in a file stored on the disk as follows:
`(node id, parent id, left/right child, value)`. The path to the file is specified as a CLI argument to the program.

There is no limit to the size of the tree.

### Input

See an example in [input.json](input.json).

![Example input](input.png)

### Output

For the provided example, the expected output is `H, D, E, B, F, G, C, A`

## Implementations

### C#

### Kotlin

### Go

### Node.js

The Node.js program can be executed directly as CLI program granted that Node.js is installed on the system: `./tree.js ../input.json`. Alternatively, you can execute it with `node tree.json ../input.json`.

The program was developed and tested with **Node v16.14.0** altought any recent version (supporting promise-based `fs`, classes, and object destructuring) should be able to run it.
