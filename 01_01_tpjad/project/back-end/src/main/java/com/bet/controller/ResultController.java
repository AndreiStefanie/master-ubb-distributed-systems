package com.bet.controller;

import com.bet.dao.*;
import com.bet.util.MailService;
import org.hibernate.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@RestController
public class ResultController {
  @Autowired
  private org.hibernate.Session session;

  @RequestMapping(value = "/api/result/all", method = RequestMethod.GET)
  public List<ResultsEntity> getAllResults() {
    String stm = "FROM ResultsEntity";
    Query query = session.createQuery(stm);
    @SuppressWarnings("unchecked") List<ResultsEntity> results = (List<ResultsEntity>) query.list();
    for (ResultsEntity it : results) {
      it.getEventByMatchId().setResultssByMatchId(null);
      it.getEventByMatchId().setTicketMatchRelsByMatchId(null);
    }

    return results;
  }

  @RequestMapping(value = "/api/result/sport", method = RequestMethod.GET)
  public List<ResultsEntity> getSportResult(@RequestParam(value = "sport") String sport) {
    String stm = "SELECT r FROM ResultsEntity r JOIN r.eventByMatchId e " + "WHERE e.sport = :sport";
    Query query = session.createQuery(stm).setString("sport", sport);
    @SuppressWarnings("unchecked") List<ResultsEntity> results = (List<ResultsEntity>) query.list();
    for (ResultsEntity it : results) {
      it.getEventByMatchId().setResultssByMatchId(null);
      it.getEventByMatchId().setTicketMatchRelsByMatchId(null);
    }

    return results;
  }

  @RequestMapping(value = "/api/result/ticket", method = RequestMethod.GET)
  public int getResultForTicket(@RequestParam(value = "ticket") int ticket) {
    int goodEvents = 0;
    String stm = "SELECT r FROM ResultsEntity AS r INNER JOIN r.eventByMatchId AS e " + "INNER JOIN e.ticketMatchRelsByMatchId AS t WHERE t.ticketId = :ticketID";
    Query query = session.createQuery(stm).setInteger("ticketID", ticket);
    if (query.list().size() > 0) {
      @SuppressWarnings("unchecked") List<ResultsEntity> results = (List<ResultsEntity>) query.list();
      for (ResultsEntity resultsEntity : results) {
        String result;
        if (resultsEntity.getResultA() > resultsEntity.getResultB()) result = "1";
        else if (resultsEntity.getResultA().equals(resultsEntity.getResultB())) result = "X";
        else result = "2";
        stm = "FROM TicketMatchRelEntity WHERE matchId = :matchID AND ticketId = :ticketID";
        query = session.createQuery(stm).setInteger("matchID", resultsEntity.getMatchId()).setInteger("ticketID", ticket);
        TicketMatchRelEntity relEntity = (TicketMatchRelEntity) query.list().get(0);
        if (relEntity.getBetType().equals(result)) goodEvents++;
      }
      stm = "FROM TicketMatchRelEntity WHERE ticketId = :ticketID";
      query = session.createQuery(stm).setInteger("ticketID", ticket);
      if (goodEvents == query.list().size()) return 1;
      else return 0;
    }

    return -1;
  }

  @RequestMapping(value = "api/result/generate", method = RequestMethod.GET)
  public int generateRandomResults() {
    List<EventEntity> eventsForTickets = new ArrayList<>();
    Timestamp now = new Timestamp(System.currentTimeMillis());
    String stm = "FROM EventEntity e WHERE moment < :moment " + "AND e NOT IN (SELECT r.eventByMatchId FROM ResultsEntity r)";
    Query query = session.createQuery(stm).setString("moment", "" + now);
    @SuppressWarnings("unchecked") ArrayList<EventEntity> events = (ArrayList<EventEntity>) query.list();

    for (EventEntity e : events) {
      ResultsEntity result = new ResultsEntity();
      result.setMatchId(e.getMatchId());
      result.setResultA(ThreadLocalRandom.current().nextInt(1, 20));
      result.setResultB(ThreadLocalRandom.current().nextInt(1, 20));
      eventsForTickets.add(e);
      session.beginTransaction();
      session.save(result);
      session.getTransaction().commit();
    }

    if (eventsForTickets.size() > 0) updateTickets(eventsForTickets);

    return events.size();
  }

  private void updateTickets(List<EventEntity> events) {
    String stm = "SELECT t.ticketByTicketId FROM TicketMatchRelEntity t WHERE t.eventByMatchId IN (:events)";
    Query query = session.createQuery(stm).setParameterList("events", events);
    @SuppressWarnings("unchecked") List<TicketEntity> tickets = (List<TicketEntity>) query.list();
    for (TicketEntity t : tickets) {
      session.beginTransaction();
      if (getResultForTicket(t.getTicketId()) == 1) {
        t.setStatus("WIN");

        UserEntity user = t.getUserByUserId();
        for (UserDetailsEntity userDetailsEntity : user.getUserDetailssByUserId()) {
          userDetailsEntity.setBalance(userDetailsEntity.getBalance() + t.getBetAmount() * t.getOdds());
          session.beginTransaction();
          session.merge(userDetailsEntity);
          session.getTransaction().commit();
          MailService mailService = new MailService("ds.assignment.3.1@gmail.com", "assignment3.1");
          mailService.sendMail(userDetailsEntity.getEmail(), "Congratulations!", "Your ticket #" + t.getTicketId() + " is a winning one." + " Your new balance is " + userDetailsEntity.getBalance() + ".");
        }
      } else t.setStatus("LOSE");
      session.beginTransaction();
      session.merge(t);
      session.getTransaction().commit();
    }
  }
}
