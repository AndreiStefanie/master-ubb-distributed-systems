package com.bet.dao;

import java.util.Collection;

public class UserEntity {
  private int userId;
  private String username;
  private String password;
  private String type;
  private Collection<TicketEntity> ticketsByUserId;
  private Collection<UserDetailsEntity> userDetailssByUserId;

  public int getUserId() {
    return userId;
  }

  public void setUserId(int userId) {
    this.userId = userId;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o)
      return true;
    if (o == null || getClass() != o.getClass())
      return false;

    UserEntity that = (UserEntity) o;

    if (userId != that.userId)
      return false;
    if (username != null ? !username.equals(that.username) : that.username != null)
      return false;
    if (password != null ? !password.equals(that.password) : that.password != null)
      return false;
    if (type != null ? !type.equals(that.type) : that.type != null)
      return false;

    return true;
  }

  @Override
  public int hashCode() {
    int result = userId;
    result = 31 * result + (username != null ? username.hashCode() : 0);
    result = 31 * result + (password != null ? password.hashCode() : 0);
    result = 31 * result + (type != null ? type.hashCode() : 0);
    return result;
  }

  public Collection<TicketEntity> getTicketsByUserId() {
    return ticketsByUserId;
  }

  public void setTicketsByUserId(Collection<TicketEntity> ticketsByUserId) {
    this.ticketsByUserId = ticketsByUserId;
  }

  public Collection<UserDetailsEntity> getUserDetailssByUserId() {
    return userDetailssByUserId;
  }

  public void setUserDetailssByUserId(Collection<UserDetailsEntity> userDetailssByUserId) {
    this.userDetailssByUserId = userDetailssByUserId;
  }
}
