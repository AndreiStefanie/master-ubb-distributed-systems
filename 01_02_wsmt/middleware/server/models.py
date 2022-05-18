import os
from peewee import *
from playhouse.db_url import connect

db = connect(os.environ.get('DATABASE') or 'sqlite:///default.db')


class Person(Model):
    name = CharField()
    birthday = DateField()

    class Meta:
        database = db


class Book(Model):
    title = CharField()
    author = ForeignKeyField(Person, backref='books')
    published_at = DateField()

    class Meta:
        database = db
