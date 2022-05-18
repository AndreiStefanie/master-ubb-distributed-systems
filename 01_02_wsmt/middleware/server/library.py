from datetime import datetime
from typing import List
from models import Book, Person


class LibraryService:
    def add_book(self, title: str, author_id: int, published_at: datetime):
        author = Person.get_by_id(author_id)
        return Book.create(title=title, author=author, published_at=published_at)

    def get_books(self, q: str):
        query = Book.select().join(Person)
        if q != '':
            query = query.where(Book.title.contains(q))

        books: List[Book] = []
        for b in query:
            books.append(b)

        return books

    def update_book(self, id: int, title: str):
        return Book.get_by_id(id).update(title=title)

    def delete_book(self, id: int):
        return Book.delete_by_id(id)

    def add_author(self, name: str, birthday: datetime):
        return Person.create(name=name, birthday=birthday)

    def get_authors(self, q: str):
        query = Person.select()
        if q != '':
            query = query.where(Person.name.contains(q))

        authors: List[Person] = []
        for p in query:
            authors.append(p)

        return authors

    def update_author(self, id: int, name: str):
        return Person.get_by_id(id).update(name=name)

    def delete_author(self, id: int):
        return Person.delete_by_id(id)
