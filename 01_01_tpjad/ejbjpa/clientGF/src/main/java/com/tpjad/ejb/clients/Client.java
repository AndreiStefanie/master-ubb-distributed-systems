package com.tpjad.ejb.clients;

import com.tpjad.ejb.dtos.NoteDTO;
import com.tpjad.ejb.interfaces.UserNotesRemote;

import java.util.*;
import javax.naming.*;

public class Client {
  static final String JNDIFacadeR = "java:global/server/UserNotesBean!com.tpjad.ejb.interfaces.UserNotesRemote";

  public static void main(String[] args) throws Exception {
    Context context = createInitialContext();
    UserNotesRemote proxy = (UserNotesRemote) context.lookup(JNDIFacadeR);

    System.out.println("Client started");

    // Add a new user note
    proxy.addNoteForUserR("Build git", "Linus");

    // Print all the user notes
    System.out.println("Notes: \n");
    for (NoteDTO noteDTO : proxy.getAllNotesR()) {
      System.out.println("user:" + noteDTO.getUsername() + ", note:" + noteDTO.getNote());
    }
  }

  private static Context createInitialContext() throws NamingException {
    Properties jndiProperties = new Properties();
    jndiProperties.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.enterprise.naming.impl.SerialInitContextFactory");
    jndiProperties.put("org.omg.CORBA.ORBInitialHost", "localhost");
    jndiProperties.put("org.omg.CORBA.ORBInitialPort", "3700");

    return new InitialContext(jndiProperties);
  }
}
