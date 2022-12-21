CC = gcc
CFLAGS = -g -Wall -ggdb

SRC = ult.c
OBJ = $(patsubst %.c,%.o,$(SRC))

# pattern rule for object files
%.o: %.c
	$(CC) -c $(CFLAGS) $< -o $@

main: main.o $(OBJ)
	$(CC) -o main main.o $(OBJ)

clean:
	$(RM) -f *.o main