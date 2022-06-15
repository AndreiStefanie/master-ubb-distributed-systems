package wsmt.rest.models;

public class Book {
  private int ID;
  private String title;
  private int publishingYear;
  private int authorId;

  public int getID() {
    return ID;
  }

  public void setID(int iD) {
    ID = iD;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public int getPublishingYear() {
    return publishingYear;
  }

  public void setPublishingYear(int publishingYear) {
    this.publishingYear = publishingYear;
  }

  public int getAuthorId() {
    return authorId;
  }

  public void setAuthorId(int authorId) {
    this.authorId = authorId;
  }
}
