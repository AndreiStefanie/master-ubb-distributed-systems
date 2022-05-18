using CommandLine;
using Razorvine.Pyro;

namespace QuickStart
{
  class Program
  {
    [Verb("authors", HelpText = "Manage authors")]
    class AuthorsOptions
    {
      [Value(0)]
      public string Operation { get; set; } = "";
      [Option()]
      public string Name { get; set; } = "";
      [Option()]
      public DateTime Date { get; set; } = DateTime.Now;
      [Option()]
      public int Id { get; set; } = 0;
    }

    [Verb("books", HelpText = "Manage books")]
    class BooksOptions
    {
      [Value(0)]
      public string Operation { get; set; } = "";
      [Option()]
      public string Title { get; set; } = "";
      [Option()]
      public DateTime Date { get; set; } = DateTime.Now;
      [Option()]
      public int Id { get; set; } = 0;
    }

    static void Main(string[] args)
    {
      PyroProxy proxy = new PyroProxy(new PyroURI("PYRO:library@localhost:7543"));

      Parser.Default.ParseArguments<AuthorsOptions, BooksOptions>(args)
             .WithParsed<AuthorsOptions>(o =>
             {
               dynamic result;
               switch (o.Operation)
               {
                 case "get":
                   result = proxy.call("get_authors");
                   foreach (dynamic author in result)
                   {
                     Console.WriteLine(String.Format("{0}, {1}, {2}", author["id"], author["name"], author["birthday"]));
                   }
                   return;
                 case "add":
                   result = proxy.call("add_author", o.Name, o.Date);
                   return;
                 case "delete":
                   result = proxy.call("delete_author", o.Id);
                   return;
                 case "update":
                   result = proxy.call("update_author", o.Id, o.Name);
                   return;
                 default:
                   Console.WriteLine("Unknown operation");
                   return;
               }
             })
             .WithParsed<BooksOptions>(o =>
             {
               dynamic result;
               switch (o.Operation)
               {
                 case "get":
                   result = proxy.call("get_books");
                   foreach (dynamic book in result)
                   {
                     Console.WriteLine(String.Format("{0}, {1} published in {2} by {3}", book["id"], book["title"], book["published_at"], book["author"]["name"]));
                   }
                   return;
                 case "add":
                   result = proxy.call("add_book", o.Title, o.Id, o.Date);
                   return;
                 case "delete":
                   result = proxy.call("delete_book", o.Id);
                   return;
                 case "update":
                   result = proxy.call("update_book", o.Id, o.Title);
                   return;
                 default:
                   Console.WriteLine("Unknown operation");
                   return;
               }
             });
    }
  }
}