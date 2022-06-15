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
import picocli.CommandLine.Parameters;
import picocli.CommandLine.Spec;

@Command(name = "update", headerHeading = "Update a resource", mixinStandardHelpOptions = true)
public class UpdateCmd implements Runnable {
  @Spec
  CommandSpec spec;

  private WebTarget target;

  public UpdateCmd(WebTarget target) {
    super();
    this.target = target;
  }

  @Command(name = "authors", description = "update author")
  void authors(@Parameters(index = "0") String id, @Option(names = "--name") String name) {
    WebTarget target = this.target.path("authors/" + id);

    Author author = target
        .request(MediaType.APPLICATION_JSON)
        .get(Author.class);

    author.setName(name);

    target = this.target.path("authors/" + id);
    Response response = target
        .request(MediaType.APPLICATION_JSON)
        .put(Entity.entity(author, MediaType.APPLICATION_JSON));

    if (response.getStatus() > 299) {
      System.out.println(response.readEntity(String.class));
    }
    System.out.println(response.getStatus());
  }

  @Command(name = "books", description = "update book")
  void books(@Parameters(index = "0") String id, @Option(names = "--title") String title) {
    WebTarget target = this.target.path("books/" + id);

    Book book = target
        .request(MediaType.APPLICATION_JSON)
        .get(Book.class);

    book.setTitle(title);

    target = this.target.path("books/" + id);
    Response response = target
        .request(MediaType.APPLICATION_JSON)
        .put(Entity.entity(book, MediaType.APPLICATION_JSON));
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
