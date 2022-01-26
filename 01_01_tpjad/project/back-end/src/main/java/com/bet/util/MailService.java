package com.bet.util;

import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.util.Properties;

public class MailService {
  private final String username;
  private final String password;
  private final Properties props;

  public MailService(String username, String password) {
    this.username = username;
    this.password = password;

    props = new Properties();
    props.put("mail.smtp.auth", "true");
    props.put("mail.smtp.starttls.enable", "true");
    props.put("mail.smtp.host", "smtp.gmail.com");
    props.put("mail.smtp.port", "587");
  }

  public void sendMail(String to, String subject, String content) {
    Session session = Session.getInstance(props,
        new javax.mail.Authenticator() {
          protected PasswordAuthentication getPasswordAuthentication() {
            return new PasswordAuthentication(username, password);
          }
        });

    try {

      Message message = new MimeMessage(session);
      message.setFrom(new InternetAddress(username));
      message.setRecipients(Message.RecipientType.TO,
          InternetAddress.parse(to));
      message.setSubject(subject);
      message.setText(content);

      Transport.send(message);

      System.out.println("Mail sent.");
    } catch (MessagingException e) {
      e.printStackTrace();
    }
  }
}
