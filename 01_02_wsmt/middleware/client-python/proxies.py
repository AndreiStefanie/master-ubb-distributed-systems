from abc import abstractclassmethod


class ILibraryProxy:
    @abstractclassmethod
    def get(self):
        pass

    @abstractclassmethod
    def add(self):
        pass

    @abstractclassmethod
    def delete(self):
        pass

    @abstractclassmethod
    def update(self):
        pass


class AuthorsProxy(ILibraryProxy):
    def __init__(self, proxy, args) -> None:
        self.proxy = proxy
        self.args = args

    def get(self):
        return self.proxy.get_authors(self.args.query or '')

    def add(self):
        return self.proxy.add_author(self.args.name, self.args.date)

    def delete(self):
        return self.proxy.delete_author(self.args.author_id)

    def update(self):
        return self.proxy.update_author(self.args.author_id, self.args.name)


class BooksProxy:
    def __init__(self, proxy, args) -> None:
        self.proxy = proxy
        self.args = args

    def get(self):
        return self.proxy.get_books(self.args.query or '')

    def add(self):
        return self.proxy.add_book(
            self.args.title, self.args.author_id, self.args.date)

    def delete(self):
        return self.proxy.delete_book(self.args.book_id)

    def update(self):
        return self.proxy.update_book(self.args.book_id, self.args.title)
