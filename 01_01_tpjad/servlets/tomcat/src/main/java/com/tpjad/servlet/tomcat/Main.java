package com.tpjad.servlet.tomcat;

import java.io.File;
import javax.servlet.annotation.MultipartConfig;

import org.apache.catalina.Context;
import org.apache.catalina.startup.Tomcat;

import com.tpjad.servlet.app.Root;
import com.tpjad.servlet.app.Download;
import com.tpjad.servlet.app.Sort;
import com.tpjad.servlet.app.Upload;

@MultipartConfig
public class Main {
  public static void main(String[] args) throws Exception {
    Tomcat tomcat = new Tomcat();

    File base = new File(System.getProperty("java.io.tmpdir"));
    Context ctx = tomcat.addContext("", base.getAbsolutePath());
    Tomcat.addServlet(ctx, "Download", new Download());
    Tomcat.addServlet(ctx, "Sort", new Sort());
    Tomcat.addServlet(ctx, "Upload", new Upload());
    Tomcat.addServlet(ctx, "Default", new Root());

    // System.out.println("Base: " + ctx.toString());
    // Wrapper defaultServlet = ctx.createWrapper();
    // defaultServlet.setName("default");
    // defaultServlet.setServletClass("org.apache.catalina.servlets.DefaultServlet");
    // defaultServlet.addInitParameter("debug", "0");
    // defaultServlet.addInitParameter("listings", "false");
    // defaultServlet.setLoadOnStartup(1);
    // ctx.addChild(defaultServlet);
    // ctx.addServletMapping("/", "default");

    ctx.addServletMapping("/download", "Download");
    ctx.addServletMapping("/upload", "Upload");
    ctx.addServletMapping("/sort", "Sort");
    ctx.addServletMapping("/", "Default");

    tomcat.setPort(8080);
    tomcat.start();
    tomcat.getServer().await();
  }

}
