package com.tpjad.ejb.interfaces;

import com.tpjad.ejb.entities.Note;
import com.tpjad.ejb.entities.User;

import javax.ejb.Local;
import java.util.List;

@Local
public interface UserNotesLocal {
  User addNoteForUser(String note, String userName);

  List<User> getAllUsers();

  List<Note> getAllNotes();

  List<Note> getAllNotesForUser(User user);
}
