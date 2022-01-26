package com.tpjad.ejb.dtos;

import com.tpjad.ejb.entities.User;

import java.io.Serializable;

public class UserDTO implements Serializable {
  private static final long serialVersionUID = 1L;

  private Long id = 1L;
  private String name = "";

  public UserDTO(User user) {
    this.id = user.getId();
    this.name = user.getName();
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }
}
