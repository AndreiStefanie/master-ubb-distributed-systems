package wsmt.rest.commands;

import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.MediaType;
import picocli.CommandLine.Command;
import picocli.CommandLine.Model.CommandSpec;
import picocli.CommandLine.Option;
import picocli.CommandLine.ParameterException;
import picocli.CommandLine.Spec;

@Command(name = "list", headerHeading = "List resources", mixinStandardHelpOptions = true)
public class ListCmd implements Runnable {
  @Spec
  CommandSpec spec;

  private WebTarget target;

  public ListCmd(WebTarget target) {
    super();
    this.target = target;
  }

  @Command(name = "authors", description = "list authors")
  void authors(@Option(names = "--query") String query) {
    WebTarget target = this.target.path("authors");
    if (query != null && !query.isEmpty()) {
      target = target.queryParam("query", query);
    }

    String response = target
        .request(MediaType.APPLICATION_JSON)
        .get(String.class);
    System.out.println(response);
  }

  @Command(name = "books", description = "list books")
  void books(@Option(names = "--query") String query) {
    WebTarget target = this.target.path("books");
    if (query != null && !query.isEmpty()) {
      target = target.queryParam("query", query);
    }

    String response = target
        .request(MediaType.APPLICATION_JSON)
        .get(String.class);
    System.out.println(response);
  }

  @Override
  public void run() {
    throw new ParameterException(spec.commandLine(), "Specify the resource");
  }
}
