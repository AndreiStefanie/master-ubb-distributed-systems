package com.bet.controller;

import com.bet.dao.EventEntity;
import org.hibernate.Query;
import org.hibernate.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;

@RestController
public class EventController {
  @Autowired
  private org.hibernate.Session session;

  @RequestMapping(value = "/api/events", method = RequestMethod.GET)
  public List<EventEntity> getSportOffer(@RequestParam(value = "sport") String sport) {
    Timestamp now = new Timestamp(System.currentTimeMillis());
    String stm = "FROM EventEntity WHERE sport = :sport AND moment >= :moment";
    Query query = session.createQuery(stm).setString("sport", sport).setString("moment", "" + now);
    @SuppressWarnings("unchecked") ArrayList<EventEntity> events = (ArrayList<EventEntity>) query.list();
    return events;
  }

  @RequestMapping(value = "/api/events/generate", method = RequestMethod.GET)
  public boolean generateRandomEvents() {
    String[] sports = {"football", "basket", "tennis"};
    String[][] events = {{"Steaua", "Dinamo", "Rapid", "Chelsea", "Liverpool", "Bayern", "Real Madrid", "Athletico", "U Cluj"}, {"AAA", "BBB", "CCC", "DDD", "EEE", "FFF", "GGG", "HHH", "III"}, {"t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9"}};
    long offset = System.currentTimeMillis() - TimeUnit.DAYS.toMillis(30);
    long end = Timestamp.valueOf("2022-02-28 00:00:00").getTime();
    long diff = end - offset + 1;
    Transaction tx = session.beginTransaction();
    for (int s = 0; s < 3; s++) {
      for (int times = 0; times < 3; times++) {
        int team1 = ThreadLocalRandom.current().nextInt(0, 9);
        int team2 = team1;
        while (team2 == team1) {
          team2 = ThreadLocalRandom.current().nextInt(0, 9);
        }
        Timestamp rand = new Timestamp(offset + (long) (Math.random() * diff));
        double odd1 = ((double) ThreadLocalRandom.current().nextInt(105, 1500) / 100.0);
        double oddX = ((double) ThreadLocalRandom.current().nextInt(105, 1500) / 100.0);
        double odd2 = ((double) ThreadLocalRandom.current().nextInt(105, 1500) / 100.0);
        EventEntity genEvent = new EventEntity();
        genEvent.setBet1(odd1);
        genEvent.setBetX(oddX);
        genEvent.setBet2(odd2);
        genEvent.setSport(sports[s]);
        genEvent.setTeamA(events[s][team1]);
        genEvent.setTeamB(events[s][team2]);
        genEvent.setMoment(rand);
        genEvent.setTimes(0);
        session.save(genEvent);
      }
    }
    tx.commit();

    return true;
  }
}
