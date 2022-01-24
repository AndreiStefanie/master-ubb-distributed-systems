package com.tpjad.ejb.dtos;

import java.io.Serializable;

public class NoteDTO implements Serializable {
  private Long id = 1L;
  private String note = "";
  private String username = "";

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getNote() {
    return note;
  }

  public void setNote(String note) {
    this.note = note;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }
}
