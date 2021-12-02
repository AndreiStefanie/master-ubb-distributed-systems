package com.tpjad.servlet.app;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.io.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import javax.servlet.annotation.*;
import javax.servlet.http.*;

/**
 * This endpoint facilitates the upload of json files to be formatted
 */
@WebServlet("/upload")
@MultipartConfig
public class Upload extends HttpServlet {

  protected void doPost(HttpServletRequest request, HttpServletResponse response) {
    try {
      // Save the file on the disk
      String fileName = generateFileName();
      String path = "C:/Users/Public/Documents/" + fileName;
      for (Part part : request.getParts()) {
        part.write(path);
        part.delete();
      }
      System.out.println(path + " uploaded");

      // Format the json file
      formatJson(new BufferedReader(new FileReader(path)), new FileWriter(path));

      // Set the response with the follow-up actions (download in this case)
      response.setContentType("text/html");
      PrintWriter writer = response.getWriter();
      setOutput(writer, fileName);
      writer.close();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  private String generateFileName() {
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy-HH:mm:ss");
    return LocalDateTime.now().format(formatter) + ".json";
  }

  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("text/html");
    PrintWriter out = response.getWriter();
    setOutput(out, "Json file");
    out.close();
  }

  /**
   * Load the json content through the provided reader, format it,
   * and save it back through the provided writer.
   *
   * @param reader How to read/load the source json
   * @param writer How to write back/save the formatted json
   */
  private void formatJson(Reader reader, Writer writer) {
    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    @SuppressWarnings("rawtypes") HashMap json = gson.fromJson(reader, HashMap.class);
    gson.toJson(json, writer);
  }

  private void setOutput(PrintWriter writer, String fileName) {
    writer.println("<html><head><title>Response</title></head>");
    writer.println("<form method=\"GET\" action=\"download\" >");
    writer.println("<input type=\"text\" name=\"fileName\" id=\"sort-input\" value=\"" + fileName + "\"/>");
    writer.println("<input type=\"submit\" value=\"Download\"/>");
    writer.println("</form>");
    writer.println("</body></html>");
  }
}
