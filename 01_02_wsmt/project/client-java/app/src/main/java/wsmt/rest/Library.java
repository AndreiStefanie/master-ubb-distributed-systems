package wsmt.rest;

import picocli.CommandLine.Command;
import picocli.CommandLine.Model.CommandSpec;
import picocli.CommandLine.ParameterException;
import picocli.CommandLine.Spec;

@Command(name = "library", headerHeading = "Manage authors/books", mixinStandardHelpOptions = true)
class Library implements Runnable {
  @Spec
  CommandSpec spec;

  @Override
  public void run() {
    throw new ParameterException(spec.commandLine(), "Specify a subcommand");
  }
}
