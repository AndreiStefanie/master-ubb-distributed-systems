package wsmt.rest.commands;

import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import picocli.CommandLine.Command;
import picocli.CommandLine.Model.CommandSpec;
import picocli.CommandLine.ParameterException;
import picocli.CommandLine.Parameters;
import picocli.CommandLine.Spec;

@Command(name = "delete", headerHeading = "Delete a resource", mixinStandardHelpOptions = true)
public class DeleteCmd implements Runnable {
  @Spec
  CommandSpec spec;

  private WebTarget target;

  public DeleteCmd(WebTarget target) {
    super();
    this.target = target;
  }

  @Command(name = "authors", description = "delete author")
  void authors(@Parameters(index = "0") String id) {
    WebTarget target = this.target.path("authors/" + id);

    Response response = target
        .request(MediaType.APPLICATION_JSON)
        .delete();
    System.out.println(response.getStatus());
  }

  @Command(name = "books", description = "delete book")
  void books(@Parameters(index = "0") String id) {
    WebTarget target = this.target.path("books/" + id);

    Response response = target
        .request(MediaType.APPLICATION_JSON)
        .delete();
    System.out.println(response.getStatus());
  }

  @Override
  public void run() {
    throw new ParameterException(spec.commandLine(), "Specify the resource");
  }
}
