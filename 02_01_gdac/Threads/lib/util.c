#include "util.h"

#include <errno.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

void block_signals() {
  sigset_t sigprof;
  sigemptyset(&sigprof);
  sigaddset(&sigprof, SIGALRM);

  if (sigprocmask(SIG_BLOCK, &sigprof, NULL) == -1) {
    perror("sigprocmask");
    abort();
  }
}

void unblock_signals() {
  sigset_t sigprof;
  sigemptyset(&sigprof);
  sigaddset(&sigprof, SIGALRM);

  if (sigprocmask(SIG_UNBLOCK, &sigprof, NULL) == -1) {
    perror("sigprocmask");
    abort();
  }
}

int ms_sleep(unsigned int ms) {
  int result = 0;

  {
    struct timespec ts_remaining = {ms / 1000, (ms % 1000) * 1000000L};

    do {
      struct timespec ts_sleep = ts_remaining;
      result = nanosleep(&ts_sleep, &ts_remaining);
    } while ((EINTR == errno) && (-1 == result));
  }

  if (-1 == result) {
    perror("nanosleep() failed");
  }

  return result;
}