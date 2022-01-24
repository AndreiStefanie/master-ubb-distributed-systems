package com.tpjad.ejb.entities;

import javax.persistence.*;

@MappedSuperclass
abstract class Base {
  @Id
  @GeneratedValue
  private Long id = 0L;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }
}