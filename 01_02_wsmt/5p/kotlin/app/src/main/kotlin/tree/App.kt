package tree

import com.google.gson.Gson
import java.io.File

class BSTNode(val id: Int, val value: String) {
    var left: BSTNode? = null
    var right: BSTNode? = null
}

data class InputNode(
    val id: Int,
    val parent: Int?,
    val right: Boolean,
    val value: String,
)

fun postOrder(node: BSTNode?, handler: (BSTNode) -> Unit) {
    if (node == null) {
        return
    }

    postOrder(node.left, handler)

    postOrder(node.right, handler)

    handler(node)
}

fun main(args: Array<String>) {
    if (args.size != 1) {
        println("Usage: ./tree.js <path_to_input_file>")
    }

    // Extract the data from the input file
    val rawInput = File(args[0]).readText()
    val inputNodes = Gson().fromJson(rawInput, Array<InputNode>::class.java)

    // Transform the data to the internal BST representation
    // The first iteration creates the nodes without linking the children
    val nodes = mutableMapOf<Int, BSTNode>()
    for (inputNode in inputNodes) {
        nodes[inputNode.id] = BSTNode(inputNode.id, inputNode.value)
    }

    // The second iteration adds the relationships between nodes
    var root: BSTNode? = null
    for (inputNode in inputNodes) {
        if (inputNode.parent == null) {
            root = nodes[inputNode.id]
            continue
        }

        val parentNode = nodes[inputNode.parent]
        val currentNode = nodes[inputNode.id]
        if (inputNode.right) {
            parentNode?.right = currentNode
        } else {
            parentNode?.left = currentNode
        }
    }

    if (root == null) {
        println("No root node provided")
        return
    }

    // Load/handle the BST - in this case simply print the node values
    postOrder(root, {node -> println(node.value)})
}
