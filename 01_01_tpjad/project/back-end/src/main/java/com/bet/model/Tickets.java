package com.bet.model;

import java.util.List;

public class Tickets {
  private int userId;
  private double betAmount;
  private List<TicketEntry> events;

  public int getUserId() {
    return userId;
  }

  public void setUserId(int userId) {
    this.userId = userId;
  }

  public double getBetAmount() {
    return betAmount;
  }

  public void setBetAmount(double betAmount) {
    this.betAmount = betAmount;
  }

  public List<TicketEntry> getEvents() {
    return events;
  }

  public void setEvents(List<TicketEntry> events) {
    this.events = events;
  }
}
