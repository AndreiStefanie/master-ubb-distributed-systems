package com.tpjad.ejb.entities;

import java.io.*;
import java.util.*;
import javax.persistence.*;

@Entity
@Table(name = "users")
public class User extends Base implements Serializable {
  private String name = "";
  @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
  private List<Note> notes;

  public String getName() {
    return name;
  }

  public void setName(String userName) {
    this.name = userName;
  }

  public List<Note> getNotes() {
    return notes;
  }

  public void setNotes(List<Note> notes) {
    this.notes = notes;
  }
}
