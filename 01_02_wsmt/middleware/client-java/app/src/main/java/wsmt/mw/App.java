package wsmt.mw;

import java.io.IOException;

import net.razorvine.pyro.PyroProxy;
import net.razorvine.pyro.PyroURI;
import picocli.CommandLine;

public class App {
    public static void main(String[] args) {
        try {
            PyroProxy proxy = new PyroProxy(new PyroURI("PYRO:library@localhost:7543"));
            int exitCode = new CommandLine(new Library(proxy)).execute(args);
            System.exit(exitCode);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
