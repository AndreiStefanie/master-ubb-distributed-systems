using System.Reflection;
using System.Text;
using CommandLine;
using System.Text.Json;

namespace Project
{
  class Program
  {
    class BaseOptions
    {
      [Value(0)]
      public string Resource { get; set; } = "";
    }

    [Verb("list", HelpText = "List resources")]
    class ListOptions : BaseOptions
    {
      [Option()]
      public string Query { get; set; } = "";
    }

    [Verb("get", HelpText = "Get a certain resource")]
    class GetOptions : BaseOptions
    {
      [Value(1)]
      public string Id { get; set; } = "";
    }

    [Verb("add", HelpText = "Add a resource")]
    class AddOptions : BaseOptions
    {
      [Option()]
      public string Name { get; set; } = "";
      [Option()]
      public string Title { get; set; } = "";
      [Option()]
      public int Year { get; set; } = 0;
      [Option()]
      public int Author { get; set; } = 0;
    }

    [Verb("update", HelpText = "Update a resource")]
    class UpdateOptions : BaseOptions
    {
      [Value(1)]
      public string Id { get; set; } = "";
      [Option()]
      public string Name { get; set; } = "";
      [Option()]
      public string Title { get; set; } = "";
    }

    [Verb("delete", HelpText = "Delete a resource")]
    class DeleteOptions : BaseOptions
    {
      [Value(1)]
      public string Id { get; set; } = "";
    }

    //load all types using Reflection
    private static Type[] LoadVerbs()
    {
      return Assembly.GetExecutingAssembly().GetTypes()
        .Where(t => t.GetCustomAttribute<VerbAttribute>() != null).ToArray();
    }

    private static async void Run(object obj)
    {
      HttpClient client = new HttpClient();
      client.BaseAddress = new Uri("http://localhost:8080/v1/");

      try
      {
        HttpResponseMessage? response = null;
        StringContent? data = null;
        switch (obj)
        {
          case ListOptions c:
            var path = c.Resource;
            if (c.Query.Length > 0)
            {
              path += "?query=" + c.Query;
            }
            response = client.GetAsync(path).Result;
            break;
          case GetOptions c:
            response = client.GetAsync(c.Resource + "/" + c.Id).Result;
            break;
          case DeleteOptions c:
            response = client.DeleteAsync(c.Resource + "/" + c.Id).Result;
            break;
          case AddOptions c:
            switch (c.Resource)
            {
              case "authors":
                {
                  var author = new Author();
                  author.name = c.Name;
                  var json = JsonSerializer.Serialize<Author>(author);
                  data = new StringContent(json, Encoding.UTF8, "application/json");
                  break;
                }
              case "books":
                {
                  var book = new Book();
                  book.title = c.Title;
                  book.publicationYear = c.Year;
                  book.authorId = c.Author;
                  var json = JsonSerializer.Serialize<Book>(book);
                  data = new StringContent(json, Encoding.UTF8, "application/json");
                  break;
                }
              default:
                Console.WriteLine("Unsupported resource ", c.Resource);
                return;
            }

            if (data != null)
            {
              response = client.PostAsync(c.Resource, data).Result;
            }
            break;
          case UpdateOptions c:
            switch (c.Resource)
            {
              case "authors":
                {
                  var author = new Author();
                  author.name = c.Name;
                  var json = JsonSerializer.Serialize<Author>(author);
                  data = new StringContent(json, Encoding.UTF8, "application/json");
                  break;
                }
              case "books":
                {
                  var bookResponse = client.GetAsync(c.Resource + "/" + c.Id).Result;
                  var book = JsonSerializer.Deserialize<Book>(bookResponse.Content.ReadAsStream());
                  if (book == null)
                  {
                    Console.WriteLine("Could not retrieve the book for update ", c.Resource);
                    return;
                  }
                  book.title = c.Title;
                  var json = JsonSerializer.Serialize<Book>(book);
                  data = new StringContent(json, Encoding.UTF8, "application/json");
                  break;
                }
              default:
                Console.WriteLine("Unsupported resource ", c.Resource);
                return;
            }

            if (data != null)
            {
              response = client.PutAsync(c.Resource + "/" + c.Id, data).Result;
            }
            break;
        }
        if (response != null)
        {
          Console.WriteLine(await response.Content.ReadAsStringAsync());
        }
      }
      catch (System.Exception e)
      {
        Console.WriteLine(e);
      }
    }

    static void Main(string[] args)
    {
      var types = LoadVerbs();

      Parser.Default.ParseArguments(args, types).WithParsed(Run);
    }
  }
}