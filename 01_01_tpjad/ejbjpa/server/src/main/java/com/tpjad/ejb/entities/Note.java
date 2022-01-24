package com.tpjad.ejb.entities;

import java.io.*;
import javax.persistence.*;

@Entity
public class Note extends Base implements Serializable {
  private String note = "";
  @ManyToOne
  private User user;

  public String getNote() {
    return this.note;
  }

  public void setNote(String newNote) {
    if (newNote == null || newNote.isEmpty()) {
      return;
    }
    this.note = newNote;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }

  @Override
  public String toString() {
    return "{id: " + getId() + " , note: " + getNote() + " , userId: " + getUser().getId() + "}";
  }
}
