package wsmt.rest.commands;

import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import picocli.CommandLine.Command;
import picocli.CommandLine.Option;
import picocli.CommandLine.Model.CommandSpec;
import wsmt.rest.models.Author;
import wsmt.rest.models.Book;
import picocli.CommandLine.ParameterException;
import picocli.CommandLine.Spec;

@Command(name = "add", headerHeading = "Add a resource", mixinStandardHelpOptions = true)
public class AddCmd implements Runnable {
  @Spec
  CommandSpec spec;

  private WebTarget target;

  public AddCmd(WebTarget target) {
    super();
    this.target = target;
  }

  @Command(name = "authors", description = "add author")
  void authors(@Option(names = "--name") String name) {
    WebTarget target = this.target.path("authors");

    Author author = new Author();
    author.setName(name);

    Response response = target
        .request(MediaType.APPLICATION_JSON)
        .post(Entity.entity(author, MediaType.APPLICATION_JSON));
    if (response.getStatus() > 299) {
      System.out.println(response.readEntity(String.class));
    }
    System.out.println(response.getStatus());
  }

  @Command(name = "books", description = "add book")
  void books(@Option(names = "--title") String title, @Option(names = "--year") int year,
      @Option(names = "--author") int authorId) {
    WebTarget target = this.target.path("books");

    Book book = new Book();
    book.setTitle(title);
    book.setPublicationYear(year);
    book.setAuthorId(authorId);

    Response response = target
        .request(MediaType.APPLICATION_JSON)
        .post(Entity.entity(book, MediaType.APPLICATION_JSON));
    if (response.getStatus() > 299) {
      System.out.println(response.readEntity(String.class));
    }
    System.out.println(response.getStatus());
  }

  @Override
  public void run() {
    throw new ParameterException(spec.commandLine(), "Specify the resource");
  }
}
