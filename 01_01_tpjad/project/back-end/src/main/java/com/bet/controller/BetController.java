package com.bet.controller;

import com.bet.dao.EventEntity;
import com.bet.dao.TicketEntity;
import com.bet.dao.TicketMatchRelEntity;
import com.bet.model.TicketEntry;
import com.bet.model.Tickets;
import org.hibernate.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BetController {
  @Autowired
  private org.hibernate.Session session;

  @RequestMapping(value = "/api/bet/add", method = RequestMethod.POST)
  public void addTicket(@RequestBody Tickets tickets) {
    double totalOdds = 1.0;
    TicketEntity ticketEntity = new TicketEntity();
    ticketEntity.setUserId(tickets.getUserId());
    ticketEntity.setBetAmount(tickets.getBetAmount());
    ticketEntity.setStatus("PROGRESS");
    ticketEntity.setOdds(1.0);
    session.beginTransaction();
    session.save(ticketEntity);
    session.getTransaction().commit();
    for (TicketEntry t : tickets.getEvents()) {
      String stm = "FROM EventEntity WHERE matchId = :matchID";
      Query query = session.createQuery(stm).setString("matchID", "" + t.getMatchId());
      if (query.list().size() > 0) {
        EventEntity event = (EventEntity) query.list().get(0);
        TicketMatchRelEntity relEntity = new TicketMatchRelEntity();
        relEntity.setMatchId(t.getMatchId());
        relEntity.setTicketId(ticketEntity.getTicketId());
        switch (t.getBetType()) {
          case '1':
            relEntity.setBetType("1");
            totalOdds *= event.getBet1();
            break;
          case '2':
            relEntity.setBetType("2");
            totalOdds *= event.getBet2();
            break;
          case 'X':
            relEntity.setBetType("X");
            totalOdds *= event.getBetX();
            break;
        }
        event.setTimes(event.getTimes() + 1);
        session.beginTransaction();
        session.update(event);
        session.save(relEntity);
        session.getTransaction().commit();
      }
      ticketEntity.setOdds(totalOdds);
      session.beginTransaction();
      session.update(ticketEntity);
      session.getTransaction().commit();
    }
  }
}
