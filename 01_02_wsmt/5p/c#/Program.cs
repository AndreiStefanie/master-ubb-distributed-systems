using System.Text.Json;

class InputNode
{
  public int id { get; set; }
  public int? parent { get; set; }
  public bool right { get; set; }
  public string value { get; set; } = string.Empty;
}

class BSTNode
{
  public int Id { get; }
  public string Value { get; }
  public BSTNode? Left { get; set; }
  public BSTNode? Right { get; set; }

  public BSTNode(int id, string value)
  {
    this.Id = id;
    this.Value = value;
  }
}

class Tree
{
  public static void Main()
  {
    string[] args = Environment.GetCommandLineArgs();
    if (args.Length != 2)
    {
      Console.WriteLine("Usage: Tree <path_to_json_file>");
    }

    using (var reader = File.OpenText(args[1]))
    {
      // Extract the data from the input file
      var rawInput = reader.ReadToEnd();
      var inputNodes = JsonSerializer.Deserialize<InputNode[]>(rawInput)!;

      // Transform the data to the internal BST representation
      // The first iteration creates the nodes without linking the children
      var nodes = new Dictionary<int, BSTNode>();
      foreach (var inputNode in inputNodes)
      {
        nodes[inputNode.id] = new BSTNode(inputNode.id, inputNode.value);
      }

      // The second iteration adds the relationships between nodes
      BSTNode? root = default;
      foreach (var inputNode in inputNodes)
      {
        if (inputNode.parent == null)
        {
          root = nodes[inputNode.id];
          // Nothing to do for the root input node
          continue;
        }

        var parentNode = nodes[inputNode.parent.Value];
        var currentNode = nodes[inputNode.id];
        if (inputNode.right)
        {
          parentNode.Right = currentNode;
        }
        else
        {
          parentNode.Left = currentNode;
        }
      }

      if (root == null)
      {
        Console.WriteLine("No root node provided");
        return;
      }

      // Load/handle the BST - in this case simply print the node values
      PostOrder(root, Display);
    }
  }

  private static void PostOrder(BSTNode node, Action<BSTNode> handler)
  {
    if (node.Left != null)
    {
      PostOrder(node.Left, handler);
    }

    if (node.Right != null)
    {
      PostOrder(node.Right, handler);
    }

    handler(node);
  }

  private static void Display(BSTNode node)
  {
    Console.WriteLine(node.Value);
  }
}
