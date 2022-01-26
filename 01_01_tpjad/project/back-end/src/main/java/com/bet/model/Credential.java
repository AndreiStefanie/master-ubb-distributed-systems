package com.bet.model;

public class Credential {
  private String username, password;

  public Credential(String username, String password) {
    this.username = username;
    this.password = password;
  }

  String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public boolean equals(Object object) {
    if (this == object)
      return true;
    if (!(object instanceof Credential))
      return false;

    Credential otherUser = (Credential) object;
    return this.username.equals(otherUser.getUsername()) && this.password.equals(otherUser.getPassword());
  }
}
