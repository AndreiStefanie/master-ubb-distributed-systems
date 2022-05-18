package wsmt.mw;

import picocli.CommandLine.Command;
import picocli.CommandLine.Option;
import picocli.CommandLine.Parameters;

import java.util.Date;
import java.util.List;
import java.util.concurrent.Callable;

import net.razorvine.pyro.PyroProxy;

@Command(name = "library", headerHeading = "Manage authors/books")
class Library implements Callable<Integer> {
  @Parameters(index = "0", description = "authors/books")
  private String entity;

  @Parameters(index = "1", description = "get/add/delete/update")
  private String operation;

  @Option(names = { "-n", "--name" }, description = "The name of the author for add/update")
  private String name = "";

  @Option(names = { "-t", "--title" }, description = "The title of the book for add/update")
  private String title = "";

  @Option(names = { "-q", "--query" }, description = "Substring to look for in author/book names/titles")
  private String query = "";

  @Option(names = { "-d", "--date" }, description = "The publish date or author birthday")
  private Date date;

  @Option(names = { "-id",
      "--id" }, description = "The id of the author/book for update/delete or the id of the author for book add")
  private int id;

  private PyroProxy proxy;

  public Library(PyroProxy proxy) {
    super();
    this.proxy = proxy;
  }

  @Override
  public Integer call() throws Exception {
    if ("books".equals(entity))
      switch (operation) {
        case "get":
          @SuppressWarnings("unchecked")
          List<Object> books = (List<Object>) proxy.call("get_books", query);
          for (Object book : books) {
            System.out.println(book);
          }
          break;
        case "add":
          proxy.call("add_book", title, id, date);
          break;
        case "delete":
          proxy.call("delete_book", id);
          break;
        case "update":
          proxy.call("update_book", id, title);
          break;
        default:
          return 4;
      }
    else if ("authors".equals(entity)) {
      switch (operation) {
        case "get":
          @SuppressWarnings("unchecked")
          List<Object> authors = (List<Object>) proxy.call("get_authors", query);
          for (Object author : authors) {
            System.out.println(author);
          }
          break;
        case "add":
          proxy.call("add_author", name, date);
          break;
        case "delete":
          proxy.call("delete_author", id);
          break;
        case "update":
          proxy.call("update_author", id, name);
          break;
        default:
          return 3;
      }
    } else {
      return 2;
    }
    return 0;
  }
}
