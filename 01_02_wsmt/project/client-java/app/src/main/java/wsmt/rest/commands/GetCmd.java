package wsmt.rest.commands;

import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.MediaType;
import picocli.CommandLine.Command;
import picocli.CommandLine.Model.CommandSpec;
import picocli.CommandLine.ParameterException;
import picocli.CommandLine.Parameters;
import picocli.CommandLine.Spec;

@Command(name = "get", headerHeading = "Get a resource", mixinStandardHelpOptions = true)
public class GetCmd implements Runnable {
  @Spec
  CommandSpec spec;

  private WebTarget target;

  public GetCmd(WebTarget target) {
    super();
    this.target = target;
  }

  @Command(name = "authors", description = "get author")
  void authors(@Parameters(index = "0") String id) {
    WebTarget target = this.target.path("authors/" + id);

    String response = target
        .request(MediaType.APPLICATION_JSON)
        .get(String.class);
    System.out.println(response);
  }

  @Command(name = "books", description = "get book")
  void books(@Parameters(index = "0") String id) {
    WebTarget target = this.target.path("books/" + id);

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
