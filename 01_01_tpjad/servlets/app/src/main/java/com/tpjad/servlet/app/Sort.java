package com.tpjad.servlet.app;

import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.*;
import java.nio.file.*;
import java.util.*;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

//Acest servlet este responsabil de sortarea json-ului primit
//Dupa sortare, fisierul de pe disk este inlocuit cu cel sortat
//Pentru parsarea fisierului s-a folosit libraria "gson" 
@WebServlet("/sort")
public class Sort extends HttpServlet {
  public void doPost(HttpServletRequest request,
                     HttpServletResponse response) {
    try {
      String fileName = request.getParameter("fileName");
      String filePath = "C:/Users/Public/Documents/" + fileName + ".json";
      String sorted = sortJson(filePath);
      write(sorted, filePath);
    } catch (Exception e) {
      e.printStackTrace();
    }

  }

  //Sortarea fisierului se realizeaza prin proprietatile si metodele clasei "Collections"
  //Se introduc valorile intr-un arrayList, iar prin intermediul .sort() al "Collections" se realizeaza sortarea de la A-Z
  private String sortJson(String filePath) throws IOException {
    List<String> content = Files.readAllLines(Paths.get(filePath));
    StringBuilder json = new StringBuilder();
    for (String line : content) {
      json.append(line);
    }
    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    String[] list = gson.fromJson(json.toString(), String[].class);
    return gson.toJson(list);
  }

  private static void write(String data, String filePath) throws IOException {
    Files.write(Paths.get(filePath), data.getBytes());
  }

  protected void doGet(HttpServletRequest request,
                       HttpServletResponse response) {
    doPost(request, response);
  }
}
