package com.tpjad.ejb.dtos;

import com.tpjad.ejb.entities.Note;

import java.io.Serializable;

public class NoteDTO implements Serializable {
  private static final long serialVersionUID = 1L;

  private Long id = 1L;
  private String note = "";
  private String username = "";

  public NoteDTO(Note note) {
    this.id = note.getId();
    this.note = note.getNote();
    this.username = note.getUser().getName();
  }

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
