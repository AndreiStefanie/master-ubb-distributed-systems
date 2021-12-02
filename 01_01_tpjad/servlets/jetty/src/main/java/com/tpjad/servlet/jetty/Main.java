package com.tpjad.servlet.jetty;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;

import javax.servlet.MultipartConfigElement;

import com.tpjad.servlet.app.Root;
import com.tpjad.servlet.app.Download;
import com.tpjad.servlet.app.Sort;
import com.tpjad.servlet.app.Upload;

public class Main {
  public static void main(String[] args) throws Exception {
    Server server = new Server(8080);

    ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
    context.setContextPath("/");

    context.addServlet(new ServletHolder(new Root()), "/");
    context.addServlet(new ServletHolder(new Download()), "/download");
    context.addServlet(new ServletHolder(new Sort()), "/sort");

    ServletHolder fileUploadServletHolder = new ServletHolder(new Upload());
    fileUploadServletHolder.getRegistration().setMultipartConfig(new MultipartConfigElement("/data"));
    context.addServlet(fileUploadServletHolder, "/upload");

    server.setHandler(context);
    server.start();
    server.join();
  }
}
