package com.bet.controller;

import com.bet.dao.UserDetailsEntity;
import com.bet.dao.UserEntity;
import com.bet.model.Credential;
import org.hibernate.Query;
import org.hibernate.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class AuthenticationController {
  @Autowired
  private org.hibernate.Session session;

  @RequestMapping(value = "/api/authenticate", method = RequestMethod.POST)
  public Map<String, String> attemptLogin(@RequestBody Map<String, String> credentials) {
    try {
      Credential testUser = new Credential(credentials.get("username"), credentials.get("password"));

      String statement = "FROM UserEntity WHERE username = :username";
      Query query = session.createQuery(statement).setParameter("username", credentials.get("username"));
      UserEntity user = (UserEntity) query.list().get(0);
      Credential dbUser = new Credential(user.getUsername(), user.getPassword());
      if (testUser.equals(dbUser)) {
        Map<String, String> map = new HashMap<>(1);
        map.put("userType", user.getType());
        map.put("userID", "" + user.getUserId());
        for (UserDetailsEntity details : user.getUserDetailssByUserId())
          map.put("balance", "" + details.getBalance());
        return map;
      }
    } catch (NullPointerException e) {
      e.printStackTrace();
    }
    return null;
  }

  @RequestMapping(value = "/api/register", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<String> register(@RequestBody Map<String, String> credentials) {
    String stm = "FROM UserEntity WHERE username = :username";
    Query query = session.createQuery(stm).setParameter("username", credentials.get("username"));
    if (query.list().size() != 0) {
      return new ResponseEntity<>("User already exists", HttpStatus.CONFLICT);
    }

    UserEntity user = new UserEntity();
    user.setPassword(credentials.get("password"));
    user.setType("client");
    user.setUsername(credentials.get("username"));
    Transaction tx = session.beginTransaction();
    session.save(user);

    UserDetailsEntity details = new UserDetailsEntity();
    details.setBalance(50.0);
    details.setUserId(user.getUserId());
    details.setEmail(credentials.get("email"));
    session.save(details);
    tx.commit();

    return new ResponseEntity<>("User registered", HttpStatus.CREATED);
  }
}
