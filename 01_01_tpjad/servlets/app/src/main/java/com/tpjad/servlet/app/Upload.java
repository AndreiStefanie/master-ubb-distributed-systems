package com.tpjad.servlet.app;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

import java.io.*;
import java.lang.reflect.Type;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
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
      String filename = generateFileName();
      String path = "C:/Users/Public/Documents/json/" + filename;
      for (Part part : request.getParts()) {
        part.write(path);
        part.delete();
      }
      System.out.println(path + " uploaded");

      formatJson(path);

      // Set the response with the follow-up actions (download in this case)
      response.setContentType("text/html");
      PrintWriter writer = response.getWriter();
      setOutput(writer, filename);
      writer.close();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  private String generateFileName() {
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmm");
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
   * @param path The file to format
   */
  private void formatJson(String path) throws IOException {
    Reader reader = new BufferedReader(new FileReader(path));
    int i;
    StringBuilder stringBuilder = new StringBuilder();
    while ((i = reader.read()) != -1) {
      stringBuilder.append((char) i);
    }

    System.out.println("Formatting json " + path);
    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    Type type = new TypeToken<Map<String, String>>() {
    }.getType();
    Map<String, String> json = gson.fromJson(stringBuilder.toString(), type);
    Writer writer = new FileWriter(path);
    gson.toJson(json, writer);

    reader.close();
    writer.close();
  }

  private void setOutput(PrintWriter writer, String filename) {
    writer.println("<html><head><title>Response</title></head>");
    writer.println("<form method=\"POST\" action=\"download\" >");
    writer.println("<input type=\"text\" name=\"filename\" value=\"" + filename + "\"/>");
    writer.println("<input type=\"submit\" value=\"Download\"/>");
    writer.println("</form>");
    writer.println("</body></html>");
  }
}
