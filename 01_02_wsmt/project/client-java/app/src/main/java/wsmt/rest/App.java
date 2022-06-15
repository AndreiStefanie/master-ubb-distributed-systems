package wsmt.rest;

import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.WebTarget;
import picocli.CommandLine;
import wsmt.rest.commands.AddCmd;
import wsmt.rest.commands.DeleteCmd;
import wsmt.rest.commands.GetCmd;
import wsmt.rest.commands.ListCmd;
import wsmt.rest.commands.UpdateCmd;

public class App {
    private static final String BASE_URI = "http://localhost:8080/v1";

    public static void main(String[] args) {
        WebTarget target = ClientBuilder.newClient().target(BASE_URI);
        CommandLine commandLine = new CommandLine(new Library())
                .addSubcommand("list", new ListCmd(target))
                .addSubcommand("get", new GetCmd(target))
                .addSubcommand("add", new AddCmd(target))
                .addSubcommand("update", new UpdateCmd(target))
                .addSubcommand("delete", new DeleteCmd(target));
        System.exit(commandLine.execute(args));
    }
}
