package wsmt.rest;

import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.WebTarget;
import picocli.CommandLine;
import wsmt.rest.commands.ListCmd;

public class App {
    private static final String BASE_URI = "http://localhost:8080/v1";

    public static void main(String[] args) {
        WebTarget target = ClientBuilder.newClient().target(BASE_URI);
        CommandLine commandLine = new CommandLine(new Library())
                .addSubcommand("list", new ListCmd(target));
        System.exit(commandLine.execute(args));
    }
}
