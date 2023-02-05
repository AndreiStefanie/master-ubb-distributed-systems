CC = gcc
CFLAGS = -Wall -g -ggdb

SRC = lib/ult.c lib/mutex.c lib/util.c lib/barrier.c lib/chan.c
OBJ = $(patsubst %.c,%.o,$(SRC))

# pattern rule for object files
%.o: %.c
	$(CC) -c $(CFLAGS) $< -o $@

main: main.o $(OBJ)
	$(CC) -o bin/main main.o $(OBJ)

mutex: mutex_test.o $(OBJ)
	$(CC) -o bin/mutex_test mutex_test.o $(OBJ)

barrier: barrier_test.o $(OBJ)
	$(CC) -o bin/barrier_test barrier_test.o $(OBJ)
	
deadlocks: deadlocks.o $(OBJ)
	$(CC) -o bin/deadlocks deadlocks.o $(OBJ)

channels: chan_test.o $(OBJ)
	$(CC) -o bin/chan_test chan_test.o $(OBJ)

clean:
	$(RM) -f *.o lib/*.o bin/*