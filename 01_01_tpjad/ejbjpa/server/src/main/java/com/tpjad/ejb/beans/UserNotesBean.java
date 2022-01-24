package com.tpjad.ejb.beans;

import javax.ejb.*;
import javax.persistence.*;
import java.util.*;
import java.util.stream.Collectors;

import com.tpjad.ejb.dtos.NoteDTO;
import com.tpjad.ejb.dtos.UserDTO;
import com.tpjad.ejb.entities.Note;
import com.tpjad.ejb.entities.User;
import com.tpjad.ejb.interfaces.UserNotesLocal;
import com.tpjad.ejb.interfaces.UserNotesRemote;

@Stateless
public class UserNotesBean implements UserNotesLocal, UserNotesRemote {
  @PersistenceContext(unitName = "tpjad_user_notes")
  private EntityManager manager;

  public User addNoteForUser(String noteText, String username) {
    if (noteText == null || noteText.isEmpty()) {
      return null;
    }

    Note note = new Note();
    note.setNote(noteText);

    User dbUser = getUserForUsername(username);
    note.setUser(dbUser);
    manager.persist(note);
    return dbUser;
  }

  public void addNoteForUserR(String note, String userName) {
    this.addNoteForUser(note, userName);
  }

  public List<User> getAllUsers() {
    TypedQuery<User> query = manager.createQuery("select u from User u ", User.class);
    return query.getResultList();
  }

  public List<Note> getAllNotes() {
    TypedQuery<Note> query = manager.createQuery("select n from Note n", Note.class);
    return query.getResultList();
  }

  public List<Note> getAllNotesForUser(User user) {
    TypedQuery<Note> query = manager.createQuery("select n from Note n where n.user = :user", Note.class);
    return query.setParameter("user", user).getResultList();
  }

  public List<UserDTO> getAllUsersR() {
    return this.getAllUsers().stream().map(this::userToDTO).collect(Collectors.toList());
  }

  public List<NoteDTO> getAllNotesR() {
    return this.getAllNotes().stream().map(this::noteToDTO).collect(Collectors.toList());
  }

  public List<NoteDTO> getAllNotesForUserR(User user) {
    return this.getAllNotesForUser(user).stream().map(this::noteToDTO).collect(Collectors.toList());
  }

  private UserDTO userToDTO(User user) {
    if (user == null) return null;
    return new UserDTO(user);
  }

  private NoteDTO noteToDTO(Note note) {
    if (note == null) return null;
    return new NoteDTO(note);
  }

  private User getUserForUsername(String username) {
    TypedQuery<User> query = manager.createQuery("select u from User u where u.name = :name", User.class);
    List<User> resultList = query.setParameter("name", username).getResultList();
    if (resultList == null || resultList.isEmpty()) {
      User dbUser = new User();
      dbUser.setName(username);
      manager.persist(dbUser);
      return dbUser;
    } else {
      return resultList.get(0);
    }
  }
}
