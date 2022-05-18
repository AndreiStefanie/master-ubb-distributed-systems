#!/usr/bin/python3
import Pyro4
from datetime import datetime
from Pyro4.util import SerializerBase

from library import LibraryService
from models import *
from playhouse.shortcuts import model_to_dict
from dotenv import load_dotenv


load_dotenv()

SerializerBase.register_class_to_dict(Person, model_to_dict)
SerializerBase.register_class_to_dict(Book, model_to_dict)


@Pyro4.expose
class Pyro4Serv:
    def __init__(self, library_svc: LibraryService) -> None:
        self.library_svc = library_svc

    def get_authors(self, query=''):
        return self.library_svc.get_authors(query)

    def add_author(self, name: str, birthday: datetime):
        return self.library_svc.add_author(name, birthday)

    def delete_author(self, id: int):
        return self.library_svc.delete_author(id)

    def update_author(self, id: int, name: str):
        return self.library_svc.update_author(id, name)

    def get_books(self, query=''):
        return self.library_svc.get_books(query)

    def add_book(self, title, author_id, published_at):
        return self.library_svc.add_book(title, author_id, published_at)

    def delete_book(self, id: int):
        return self.library_svc.delete_book(id)

    def update_book(self, id: int, title: str):
        return self.library_svc.update_book(id, title)


def start():
    db.create_tables([Person, Book])
    daemon = Pyro4.Daemon(port=7543)
    uri = daemon.register(Pyro4Serv(LibraryService()), "library")
    print("Pyro4 library app listening on: " + uri.asString())
    daemon.requestLoop()


start()
