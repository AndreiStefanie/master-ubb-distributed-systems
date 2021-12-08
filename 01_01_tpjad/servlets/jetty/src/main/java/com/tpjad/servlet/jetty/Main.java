package com.tpjad.servlet.jetty;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;

import javax.servlet.MultipartConfigElement;

import com.tpjad.servlet.app.Root;
import com.tpjad.servlet.app.Download;
import com.tpjad.servlet.app.Upload;

public class Main {
  public static void main(String[] args) throws Exception {
    Server server = new Server(8080);

    ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
    context.setContextPath("/");

    context.addServlet(new ServletHolder(new Root()), "/");
    context.addServlet(new ServletHolder(new Download()), "/download");

    ServletHolder fileUploadServletHolder = new ServletHolder(new Upload());
    fileUploadServletHolder.getRegistration().setMultipartConfig(new MultipartConfigElement("C:/Users/Public/Documents/json"));
    context.addServlet(fileUploadServletHolder, "/upload");

    server.setHandler(context);
    server.start();
    server.join();
  }
}
