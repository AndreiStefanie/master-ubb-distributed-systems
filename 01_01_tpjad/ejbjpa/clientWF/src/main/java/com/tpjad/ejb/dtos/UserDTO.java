package com.tpjad.ejb.dtos;

import java.io.Serializable;

public class UserDTO implements Serializable {
  private static final long serialVersionUID = 1L;

  private Long id = 1L;
  private String name = "";

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
