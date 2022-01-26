package com.bet.dao;

public class UserDetailsEntity {
  private int detailId;
  private Integer userId;
  private String email;
  private Double balance;
  private UserEntity userByUserId;

  public int getDetailId() {
    return detailId;
  }

  public void setDetailId(int detailId) {
    this.detailId = detailId;
  }

  public Integer getUserId() {
    return userId;
  }

  public void setUserId(Integer userId) {
    this.userId = userId;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public Double getBalance() {
    return balance;
  }

  public void setBalance(Double balance) {
    this.balance = balance;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o)
      return true;
    if (o == null || getClass() != o.getClass())
      return false;

    UserDetailsEntity that = (UserDetailsEntity) o;

    if (detailId != that.detailId)
      return false;
    if (userId != null ? !userId.equals(that.userId) : that.userId != null)
      return false;
    if (email != null ? !email.equals(that.email) : that.email != null)
      return false;
    if (balance != null ? !balance.equals(that.balance) : that.balance != null)
      return false;

    return true;
  }

  @Override
  public int hashCode() {
    int result = detailId;
    result = 31 * result + (userId != null ? userId.hashCode() : 0);
    result = 31 * result + (email != null ? email.hashCode() : 0);
    result = 31 * result + (balance != null ? balance.hashCode() : 0);
    return result;
  }

  public UserEntity getUserByUserId() {
    return userByUserId;
  }

  public void setUserByUserId(UserEntity userByUserId) {
    this.userByUserId = userByUserId;
  }
}
