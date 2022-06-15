package wsmt.rest.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(value = { "CreatedAt", "UpdatedAt", "DeletedAt", "author" })
public class Book {
  @JsonProperty("ID")
  private int id;
  private String title;
  private int publicationYear;
  private int authorId;

  public int getId() {
    return id;
  }

  public void setId(int iD) {
    id = iD;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public int getPublicationYear() {
    return publicationYear;
  }

  public void setPublicationYear(int publishingYear) {
    this.publicationYear = publishingYear;
  }

  public int getAuthorId() {
    return authorId;
  }

  public void setAuthorId(int authorId) {
    this.authorId = authorId;
  }
}
