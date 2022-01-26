package com.bet.dao;

import java.util.Collection;

public class TicketEntity {
  private int ticketId;
  private Double odds;
  private Double betAmount;
  private Integer userId;
  private String status;
  private UserEntity userByUserId;
  private Collection<TicketMatchRelEntity> ticketMatchRelsByTicketId;

  public int getTicketId() {
    return ticketId;
  }

  public void setTicketId(int ticketId) {
    this.ticketId = ticketId;
  }

  public Double getOdds() {
    return odds;
  }

  public void setOdds(Double odds) {
    this.odds = odds;
  }

  public Double getBetAmount() {
    return betAmount;
  }

  public void setBetAmount(Double betAmount) {
    this.betAmount = betAmount;
  }

  public Integer getUserId() {
    return userId;
  }

  public void setUserId(Integer userId) {
    this.userId = userId;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;

    TicketEntity that = (TicketEntity) o;

    if (ticketId != that.ticketId) return false;
    if (odds != null ? !odds.equals(that.odds) : that.odds != null) return false;
    if (betAmount != null ? !betAmount.equals(that.betAmount) : that.betAmount != null) return false;
    if (userId != null ? !userId.equals(that.userId) : that.userId != null) return false;
    if (status != null ? !status.equals(that.status) : that.status != null) return false;

    return true;
  }

  @Override
  public int hashCode() {
    int result = ticketId;
    result = 31 * result + (odds != null ? odds.hashCode() : 0);
    result = 31 * result + (betAmount != null ? betAmount.hashCode() : 0);
    result = 31 * result + (userId != null ? userId.hashCode() : 0);
    result = 31 * result + (status != null ? status.hashCode() : 0);
    return result;
  }

  public UserEntity getUserByUserId() {
    return userByUserId;
  }

  public void setUserByUserId(UserEntity userByUserId) {
    this.userByUserId = userByUserId;
  }

  public Collection<TicketMatchRelEntity> getTicketMatchRelsByTicketId() {
    return ticketMatchRelsByTicketId;
  }

  public void setTicketMatchRelsByTicketId(Collection<TicketMatchRelEntity> ticketMatchRelsByTicketId) {
    this.ticketMatchRelsByTicketId = ticketMatchRelsByTicketId;
  }
}
