#include "mutex.h"

#include <errno.h>
#include <stdio.h>

#include "util.h"

static ult_mutex_t mutexes[MAX_THREADS_COUNT];
static size_t mutex_count = 0;

int ult_mutex_init(tid_t* mutex_id) {
  if (MAX_THREADS_COUNT - 1 == mutex_count) {
    return EXIT_FAILURE;
  }

  ult_mutex_t* m = &mutexes[mutex_count];
  m->id = mutex_count;
  *mutex_id = mutex_count;
  m->holder_id = -1;
  m->waiting_threads_count = 0;

  mutex_count++;

  return EXIT_SUCCESS;
}

int ult_mutex_lock(tid_t mutex_id) {
  block_signals();
  tid_t new_holder = ult_self();
  ult_mutex_t* m = &mutexes[mutex_id];
  unblock_signals();

  if (m->holder_id == new_holder) {
    return EXIT_SUCCESS;
  }

  if (-1 != m->holder_id) {
    block_signals();
    m->waiting_threads_count++;
    m->waiting_threads[new_holder] = true;
    unblock_signals();

    while (-1 != m->holder_id) {
      ult_yield();
    }
  }

  block_signals();
  m->holder_id = new_holder;
  unblock_signals();

  return EXIT_SUCCESS;
}

int ult_mutex_unlock(tid_t mutex_id) {
  block_signals();
  tid_t self = ult_self();
  ult_mutex_t* m = &mutexes[mutex_id];

  if (m->holder_id != self) {
    // The current thread does not own the mutex.
    unblock_signals();
    errno = EPERM;
    return EXIT_FAILURE;
  }

  m->holder_id = -1;
  for (size_t i = 0; i < m->waiting_threads_count; i++) {
    m->waiting_threads[i] = false;
  }
  m->waiting_threads_count = 0;

  unblock_signals();

  return EXIT_SUCCESS;
}

int ult_mutex_destroy(tid_t mutex_id) {
  ult_mutex_t* m = &mutexes[mutex_id];

  if (-1 != m->holder_id) {
    errno = EBUSY;
    return EXIT_FAILURE;
  }

  m->id = -1;

  return EXIT_SUCCESS;
}

void display_deadlocks() {
  bool first_displayed = false;

  for (size_t i = 0; i < mutex_count; i++) {
    ult_mutex_t* m1 = &mutexes[i];
    if (-1 == m1->holder_id) {
      continue;
    }
    for (size_t j = i; j < mutex_count; j++) {
      ult_mutex_t* m2 = &mutexes[j];
      if (-1 == m2->holder_id || m1->holder_id == m2->holder_id) {
        continue;
      }

      if (m1->waiting_threads[m2->holder_id] &&
          m2->waiting_threads[m1->holder_id]) {
        // Two different threads waiting for the same lock
        printf(
            "[Deadlock] Thread %d -> mutex %d held by thread %d and thread "
            "%d -> mutex %d held by %d\n",
            m2->holder_id, m1->id, m1->holder_id, m1->holder_id, m2->id,
            m2->holder_id);
        if (!first_displayed) {
          first_displayed = true;
        }
      }
    }
  }

  if (!first_displayed) {
    printf("No deadlocks detected\n");
  }
}
