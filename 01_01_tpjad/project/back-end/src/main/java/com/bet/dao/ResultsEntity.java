package com.bet.dao;

public class ResultsEntity {
  private int resultId;
  private Integer resultA;
  private Integer resultB;
  private Integer matchId;
  private EventEntity eventByMatchId;

  public int getResultId() {
    return resultId;
  }

  public void setResultId(int resultId) {
    this.resultId = resultId;
  }

  public Integer getResultA() {
    return resultA;
  }

  public void setResultA(Integer resultA) {
    this.resultA = resultA;
  }

  public Integer getResultB() {
    return resultB;
  }

  public void setResultB(Integer resultB) {
    this.resultB = resultB;
  }

  public Integer getMatchId() {
    return matchId;
  }

  public void setMatchId(Integer matchId) {
    this.matchId = matchId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o)
      return true;
    if (o == null || getClass() != o.getClass())
      return false;

    ResultsEntity that = (ResultsEntity) o;

    if (resultId != that.resultId)
      return false;
    if (resultA != null ? !resultA.equals(that.resultA) : that.resultA != null)
      return false;
    if (resultB != null ? !resultB.equals(that.resultB) : that.resultB != null)
      return false;
    if (matchId != null ? !matchId.equals(that.matchId) : that.matchId != null)
      return false;

    return true;
  }

  @Override
  public int hashCode() {
    int result = resultId;
    result = 31 * result + (resultA != null ? resultA.hashCode() : 0);
    result = 31 * result + (resultB != null ? resultB.hashCode() : 0);
    result = 31 * result + (matchId != null ? matchId.hashCode() : 0);
    return result;
  }

  public EventEntity getEventByMatchId() {
    return eventByMatchId;
  }

  public void setEventByMatchId(EventEntity eventByMatchId) {
    this.eventByMatchId = eventByMatchId;
  }
}
