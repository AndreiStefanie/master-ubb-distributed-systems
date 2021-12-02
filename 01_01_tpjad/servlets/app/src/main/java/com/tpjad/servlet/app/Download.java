package com.tpjad.servlet.app;

import java.io.*;
import java.util.Optional;
import javax.servlet.annotation.*;
import javax.servlet.http.*;

/**
 * This endpoint facilitates downloading a specific file ("fileName" parameter) from the disk.
 * Supports both GET and POST methods.
 */
@WebServlet("/download")
public class Download extends HttpServlet {
  protected void doPost(HttpServletRequest request, HttpServletResponse response) {
    String fileName = request.getParameter("fileName");
    String filePath = "C:/Users/Public/Documents/" + fileName + ".json";
    try {
      download(filePath, response);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  /**
   * The GET method displays the list of available files for download
   */
  protected void doGet(HttpServletRequest request, HttpServletResponse response) {
    File directory = new File("C:/Users/Public/Documents");
    File[] files = directory.listFiles();

    response.setContentType("text/html");
    try {
      PrintWriter out = response.getWriter();

      if (files == null) {
        out.println("<strong>No files available</strong>");
        return;
      }

      out.println("<html><head><title>Available Files</title></head>");
      out.println("<table>");
      for (File file : files) {
        out.println("<form method=\"POST\" action=\"download\" >");
        out.println("<input type=\"hidden\" name=\"fileName\" id=\"sort-input\" value=\"" + file.getName() + "\"/>");
        out.println("<tr><td>" + file.getName() + "</td><td>Download</td></tr>");
        out.println("</form>");
      }
      out.println("</body></html>");
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void download(String fileServer, HttpServletResponse response) throws IOException {
    File fs = new File(fileServer);
    Optional<String> optionalVal = Optional.ofNullable(getServletContext().getMimeType(fileServer));
    String mimeType = optionalVal.orElse("application/octet-stream");
    response.setContentType(mimeType);
    response.setContentLength((int) fs.length());
    response.addHeader("Content-Disposition", "attachment; filename=\"" + fs.getName() + "\"");
    OutputStream out = response.getOutputStream();
    FileInputStream in = new FileInputStream(fileServer);
    for (; ; ) {
      byte[] b = new byte[4096];
      int n = in.read(b, 0, b.length);
      if (n < 0) break;
      out.write(b, 0, n);
    }
    in.close();
    out.close();
  }
}
