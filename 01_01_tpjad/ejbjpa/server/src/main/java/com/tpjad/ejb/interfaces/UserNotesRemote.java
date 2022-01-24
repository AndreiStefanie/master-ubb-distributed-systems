package com.tpjad.ejb.interfaces;

import com.tpjad.ejb.dtos.NoteDTO;
import com.tpjad.ejb.dtos.UserDTO;
import com.tpjad.ejb.entities.User;

import javax.ejb.Remote;
import java.util.List;

@Remote
public interface UserNotesRemote {
  void addNoteForUserR(String note, String userName);

  List<UserDTO> getAllUsersR();

  List<NoteDTO> getAllNotesR();

  List<NoteDTO> getAllNotesForUserR(User user);
}
