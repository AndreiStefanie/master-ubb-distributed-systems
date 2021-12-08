package com.tpjad.servlet.app;

import javax.servlet.http.*;
import java.io.*;

public class Root extends HttpServlet {
  public void doPost(HttpServletRequest request, HttpServletResponse response) {
    try {
      PrintWriter out = response.getWriter();
      out.println("<html><head><title>Format JSON</title></head>");
      out.println(("<body><form method=\"POST\" action=\"upload\" enctype=\"multipart/form-data\">"));
      out.println("<input type=\"file\" name=\"upload\" title=\"JSON File\" />");
      out.println("<input type=\"submit\" value=\"Upload\" />");
      out.println("</form></body>");

    File directory = new File("C:/Users/Public/Documents/json");
    File[] files = directory.listFiles();
      if (files == null) {
        out.println("<strong>No files available</strong>");
        return;
      }

      out.println("<html><head><title>Available Files</title></head>");
      out.println("<table><tbody>");
      for (File file : files) {
        out.println("<tr><td>" + file.getName() + "</td></tr>");
      }
      out.println("<tbody></table>");
      out.println("<form method=\"POST\" action=\"download\" >");
      out.println("<input type=\"text\" name=\"filename\"/>");
      out.println("<input type=\"submit\" value=\"Download\"/>");
      out.println("</form>");
      out.println("</html>");
      out.close();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  protected void doGet(HttpServletRequest request, HttpServletResponse response) {
    doPost(request, response);
  }
}
