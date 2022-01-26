package com.bet.util;

import org.hibernate.HibernateException;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.hibernate.service.ServiceRegistry;
import org.hibernate.service.ServiceRegistryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
public class SessionDB {
  private static final SessionFactory ourSessionFactory;
  private static final ServiceRegistry serviceRegistry;

  static {
    try {
      Configuration configuration = new Configuration();
      configuration.configure();

      serviceRegistry = new ServiceRegistryBuilder().applySettings(configuration.getProperties())
          .buildServiceRegistry();
      ourSessionFactory = configuration.buildSessionFactory(serviceRegistry);
    } catch (Throwable ex) {
      throw new ExceptionInInitializerError(ex);
    }
  }

  @Bean
  public static org.hibernate.Session getSession() throws HibernateException {
    return ourSessionFactory.openSession();
  }
}
