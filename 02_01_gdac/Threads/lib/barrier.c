#include "barrier.h"

#include <errno.h>

#include "util.h"

ult_barrier_t barriers[MAX_THREADS_COUNT];

int ult_barrier_init(tid_t* barrier_id, size_t count) {
  static size_t current_barrier_id = 0;
  if (MAX_THREADS_COUNT - 1 == current_barrier_id) {
    return EXIT_FAILURE;
  }

  ult_barrier_t* b = &barriers[current_barrier_id];
  b->id = current_barrier_id;
  *barrier_id = current_barrier_id;
  b->count = count;
  b->current_count = 0;

  current_barrier_id++;

  return EXIT_SUCCESS;
}

int ult_barrier_wait(tid_t barrier_id) {
  block_signals();
  ult_barrier_t* b = &barriers[barrier_id];
  b->current_count++;
  unblock_signals();

  while (b->current_count != b->count) {
    ult_yield();
  }

  return EXIT_SUCCESS;
}

int ult_barrier_destroy(tid_t barrier_id) {
  ult_barrier_t* b = &barriers[barrier_id];

  if (b->count != b->current_count) {
    errno = EBUSY;
    return EXIT_FAILURE;
  }

  b->count = 0;
  b->current_count = 0;
  b->id = -1;

  return EXIT_SUCCESS;
}
