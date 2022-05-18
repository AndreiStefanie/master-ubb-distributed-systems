#!/usr/bin/python3
import datetime
from os import environ
import Pyro4
import argparse

from proxies import AuthorsProxy, BooksProxy, ILibraryProxy

parser = argparse.ArgumentParser(description='Library management app')
parser.add_argument('entity', choices=['authors', 'books'])
parser.add_argument('operation', choices=[
                    'get', 'add', 'update', 'delete'])
parser.add_argument(
    '--query', help='Substring to look for in author/book names')
parser.add_argument('--name', help='The name of the author')
parser.add_argument(
    '--date', type=datetime.date.fromisoformat, help='The birthday of the author or the publishing date of the book. E.g. 1990-12-31')
parser.add_argument('--title', help='The title of the book')
parser.add_argument(
    '--author-id', help='The author of the book when adding a new book or the author to be deleted')
parser.add_argument(
    '--book-id', help='The id of the book to be updated or deleted')

args = parser.parse_args()

proxy = Pyro4.Proxy(environ.get('SERVER_URI')
                    or "PYRO:library@localhost:7543")

entityProxy: ILibraryProxy = AuthorsProxy(
    proxy, args) if args.entity == 'authors' else BooksProxy(proxy, args)

print(getattr(entityProxy, args.operation)())
