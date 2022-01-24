package com.tpjad.ejb.client;

import java.io.*;
import java.util.stream.Collectors;
import javax.ejb.*;
import javax.servlet.*;
import javax.servlet.annotation.*;
import javax.servlet.http.*;

import com.tpjad.ejb.entities.Note;
import com.tpjad.ejb.entities.User;
import com.tpjad.ejb.interfaces.UserNotesLocal;

@WebServlet(name = "ServletClient", urlPatterns = "/client")
public class ServletClient extends HttpServlet {

  @EJB
  private UserNotesLocal userNotesLocal;

  protected void doPost(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    try {
      String note = request.getParameter("note");
      String userName = request.getParameter("user");

      if (note == null || note.isEmpty()) {
        throw new Error("Note cannot be empty");
      }

      if (userName == null || userName.isEmpty()) {
        throw new Error("User cannot be empty");
      }

      User user = this.userNotesLocal.addNoteForUser(note, userName);

      if (user == null) {
        throw new Error("User not found");
      }

      String notes = this.userNotesLocal.getAllNotesForUser(user)
          .stream()
          .map(Note::toString)
          .collect(Collectors.joining("<br>"));

      request.setAttribute("notes", notes);
      RequestDispatcher dispatcher = request.getRequestDispatcher("note.jsp");
      dispatcher.forward(request, response);
    } catch (Exception e) {
      RequestDispatcher dispatcher = request.getRequestDispatcher("error.jsp");
      request.setAttribute("error", e.toString());
      dispatcher.forward(request, response);
    }
  }

  protected void doGet(HttpServletRequest request,
                       HttpServletResponse response) throws ServletException, IOException {
    doPost(request, response);
  }
}
