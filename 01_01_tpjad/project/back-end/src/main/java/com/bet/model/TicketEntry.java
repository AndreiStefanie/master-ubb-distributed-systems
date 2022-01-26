package com.bet.model;

public class TicketEntry {
  private int matchId;
  private char betType;

  public int getMatchId() {
    return matchId;
  }

  public void setMatchId(int matchId) {
    this.matchId = matchId;
  }

  public char getBetType() {
    return betType;
  }

  public void setBetType(char betType) {
    this.betType = betType;
  }
}
