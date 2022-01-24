package com.tpjad.ejb.interfaces;

import com.tpjad.ejb.dtos.NoteDTO;
import com.tpjad.ejb.dtos.UserDTO;

import java.util.List;

public interface UserNotesRemote {
  void addNoteForUserR(String note, String userName);

  List<UserDTO> getAllUsersR();

  List<NoteDTO> getAllNotesR();
}
