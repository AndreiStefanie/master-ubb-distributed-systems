package com.bet.dao;

import java.sql.Timestamp;
import java.util.Collection;

public class EventEntity {
  private int matchId;
  private String teamA;
  private String teamB;
  private Double bet1;
  private Double betX;
  private Double bet2;
  private Timestamp moment;
  private Integer times;
  private String sport;
  private Collection<ResultsEntity> resultssByMatchId;
  private Collection<TicketMatchRelEntity> ticketMatchRelsByMatchId;

  public int getMatchId() {
    return matchId;
  }

  public void setMatchId(int matchId) {
    this.matchId = matchId;
  }

  public String getTeamA() {
    return teamA;
  }

  public void setTeamA(String teamA) {
    this.teamA = teamA;
  }

  public String getTeamB() {
    return teamB;
  }

  public void setTeamB(String teamB) {
    this.teamB = teamB;
  }

  public Double getBet1() {
    return bet1;
  }

  public void setBet1(Double bet1) {
    this.bet1 = bet1;
  }

  public Double getBetX() {
    return betX;
  }

  public void setBetX(Double betX) {
    this.betX = betX;
  }

  public Double getBet2() {
    return bet2;
  }

  public void setBet2(Double bet2) {
    this.bet2 = bet2;
  }

  public Timestamp getMoment() {
    return moment;
  }

  public void setMoment(Timestamp moment) {
    this.moment = moment;
  }

  public Integer getTimes() {
    return times;
  }

  public void setTimes(Integer times) {
    this.times = times;
  }

  public String getSport() {
    return sport;
  }

  public void setSport(String sport) {
    this.sport = sport;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o)
      return true;
    if (o == null || getClass() != o.getClass())
      return false;

    EventEntity that = (EventEntity) o;

    if (matchId != that.matchId)
      return false;
    if (teamA != null ? !teamA.equals(that.teamA) : that.teamA != null)
      return false;
    if (teamB != null ? !teamB.equals(that.teamB) : that.teamB != null)
      return false;
    if (bet1 != null ? !bet1.equals(that.bet1) : that.bet1 != null)
      return false;
    if (betX != null ? !betX.equals(that.betX) : that.betX != null)
      return false;
    if (bet2 != null ? !bet2.equals(that.bet2) : that.bet2 != null)
      return false;
    if (moment != null ? !moment.equals(that.moment) : that.moment != null)
      return false;
    if (times != null ? !times.equals(that.times) : that.times != null)
      return false;
    if (sport != null ? !sport.equals(that.sport) : that.sport != null)
      return false;

    return true;
  }

  @Override
  public int hashCode() {
    int result = matchId;
    result = 31 * result + (teamA != null ? teamA.hashCode() : 0);
    result = 31 * result + (teamB != null ? teamB.hashCode() : 0);
    result = 31 * result + (bet1 != null ? bet1.hashCode() : 0);
    result = 31 * result + (betX != null ? betX.hashCode() : 0);
    result = 31 * result + (bet2 != null ? bet2.hashCode() : 0);
    result = 31 * result + (moment != null ? moment.hashCode() : 0);
    result = 31 * result + (times != null ? times.hashCode() : 0);
    result = 31 * result + (sport != null ? sport.hashCode() : 0);
    return result;
  }

  public Collection<ResultsEntity> getResultssByMatchId() {
    return resultssByMatchId;
  }

  public void setResultssByMatchId(Collection<ResultsEntity> resultssByMatchId) {
    this.resultssByMatchId = resultssByMatchId;
  }

  public Collection<TicketMatchRelEntity> getTicketMatchRelsByMatchId() {
    return ticketMatchRelsByMatchId;
  }

  public void setTicketMatchRelsByMatchId(Collection<TicketMatchRelEntity> ticketMatchRelsByMatchId) {
    this.ticketMatchRelsByMatchId = ticketMatchRelsByMatchId;
  }
}
