#include "lib/mutex.h"

#include <errno.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>

#include "lib/ult.h"
#include "lib/util.h"

#define THREAD_COUNT 10

int count = 0;
tid_t count_mutex;
tid_t last_thread;

void* f(void* arg) {
  tid_t self = ult_self();

  if (self == 3) {
    ms_sleep(3000);
  }

  ult_mutex_lock(count_mutex);
  count++;
  last_thread = self;
  ult_mutex_unlock(count_mutex);

  return NULL;
}

int main() {
  tid_t threads[THREAD_COUNT];

  int status = ult_init(1000);
  if (0 != status) {
    printf("Failed to initialize the ULT lib: %s\n", strerror(errno));
    exit(status);
  }

  status = ult_mutex_init(&count_mutex);
  if (0 != status) {
    printf("Failed to initialize the ULT mutex: %s\n", strerror(errno));
    exit(status);
  }

  for (size_t i = 0; i < THREAD_COUNT; i++) {
    status = ult_create(&threads[i], &f, NULL);
    if (0 != status) {
      printf("Failed to create the ULT thread: %s\n", strerror(errno));
      exit(status);
    }
  }

  for (size_t i = 0; i < THREAD_COUNT; i++) {
    status = ult_join(threads[i], NULL);
    if (0 != status) {
      printf("Failed to join the ULT thread: %s\n", strerror(errno));
      exit(status);
    }
  }

  printf("Final count value: %d\n", count);
  printf("The last thread that wrote was %lu\n", last_thread);

  return 0;
}