#include "lib/barrier.h"

#include <errno.h>
#include <stdio.h>
#include <string.h>
#include <time.h>
#include <unistd.h>

#include "lib/ult.h"
#include "lib/util.h"

#define THREAD_COUNT 10

tid_t barrier;

void* f1(void* arg) {
  time_t now;
  char buf[27];

  time(&now);
  printf("thread1 starting at %s", ctime_r(&now, buf));

  ms_sleep(4000);
  ult_barrier_wait(barrier);

  time(&now);
  printf("barrier in thread1() done at %s", ctime_r(&now, buf));

  return NULL;
}

void* f2(void* arg) {
  time_t now;
  char buf[27];

  time(&now);
  printf("thread2 starting at %s", ctime_r(&now, buf));

  ms_sleep(2000);
  ult_barrier_wait(barrier);

  time(&now);
  printf("barrier in thread2() done at %s", ctime_r(&now, buf));

  return NULL;
}

int main() {
  tid_t t1;
  tid_t t2;

  int status = ult_init(100000);
  if (0 != status) {
    printf("Failed to initialize the ULT lib: %s\n", strerror(errno));
    exit(status);
  }

  status = ult_barrier_init(&barrier, 3);  // main will also wait at the barrier
  if (0 != status) {
    printf("Failed to initialize the ULT barrier: %s\n", strerror(errno));
    exit(status);
  }

  status = ult_create(&t1, &f1, NULL);
  if (0 != status) {
    printf("Failed to create the ULT thread: %s\n", strerror(errno));
    exit(status);
  }

  status = ult_create(&t2, &f2, NULL);
  if (0 != status) {
    printf("Failed to create the ULT thread: %s\n", strerror(errno));
    exit(status);
  }

  ult_barrier_wait(barrier);

  return 0;
}