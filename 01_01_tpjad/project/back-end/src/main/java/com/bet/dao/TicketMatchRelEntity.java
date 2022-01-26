package com.bet.dao;

public class TicketMatchRelEntity {
  private int relId;
  private int ticketId;
  private int matchId;
  private String betType;
  private TicketEntity ticketByTicketId;
  private EventEntity eventByMatchId;

  public int getRelId() {
    return relId;
  }

  public void setRelId(int relId) {
    this.relId = relId;
  }

  public int getTicketId() {
    return ticketId;
  }

  public void setTicketId(int ticketId) {
    this.ticketId = ticketId;
  }

  public int getMatchId() {
    return matchId;
  }

  public void setMatchId(int matchId) {
    this.matchId = matchId;
  }

  public String getBetType() {
    return betType;
  }

  public void setBetType(String betType) {
    this.betType = betType;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o)
      return true;
    if (o == null || getClass() != o.getClass())
      return false;

    TicketMatchRelEntity relEntity = (TicketMatchRelEntity) o;

    if (relId != relEntity.relId)
      return false;
    if (ticketId != relEntity.ticketId)
      return false;
    if (matchId != relEntity.matchId)
      return false;
    if (betType != null ? !betType.equals(relEntity.betType) : relEntity.betType != null)
      return false;

    return true;
  }

  @Override
  public int hashCode() {
    int result = relId;
    result = 31 * result + ticketId;
    result = 31 * result + matchId;
    result = 31 * result + (betType != null ? betType.hashCode() : 0);
    return result;
  }

  public TicketEntity getTicketByTicketId() {
    return ticketByTicketId;
  }

  public void setTicketByTicketId(TicketEntity ticketByTicketId) {
    this.ticketByTicketId = ticketByTicketId;
  }

  public EventEntity getEventByMatchId() {
    return eventByMatchId;
  }

  public void setEventByMatchId(EventEntity eventByMatchId) {
    this.eventByMatchId = eventByMatchId;
  }
}
