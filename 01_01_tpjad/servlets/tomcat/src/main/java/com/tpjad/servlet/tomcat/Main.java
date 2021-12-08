package com.tpjad.servlet.tomcat;

import java.io.File;
import javax.servlet.MultipartConfigElement;
import javax.servlet.annotation.MultipartConfig;

import org.apache.catalina.Context;
import org.apache.catalina.Wrapper;
import org.apache.catalina.startup.Tomcat;

import com.tpjad.servlet.app.Root;
import com.tpjad.servlet.app.Download;
import com.tpjad.servlet.app.Upload;

@MultipartConfig
public class Main {
  public static void main(String[] args) throws Exception {
    Tomcat tomcat = new Tomcat();

    File base = new File("C:/Users/Public/Documents/json");
    Context ctx = tomcat.addContext("", base.getAbsolutePath());

    Tomcat.addServlet(ctx, "Root", new Root());
    Tomcat.addServlet(ctx, "Download", new Download());

    Wrapper uploadWrapper = Tomcat.addServlet(ctx, "Upload", new Upload());
    uploadWrapper.setMultipartConfigElement(new MultipartConfigElement(base.getAbsolutePath()));

    ctx.addServletMapping("/download", "Download");
    ctx.addServletMapping("/upload", "Upload");
    ctx.addServletMapping("/", "Root");

    tomcat.setPort(8080);
    tomcat.start();
    tomcat.getServer().await();
  }

}
