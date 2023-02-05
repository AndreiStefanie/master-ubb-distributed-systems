#ifndef ULT_MUTEX_H
#define ULT_MUTEX_H
#include "ult.h"

typedef struct ult_mutex_t {
  int id;
  int holder_id;
  bool waiting_threads[MAX_THREADS_COUNT];
  int waiting_threads_count;
} ult_mutex_t;

int ult_mutex_init(tid_t* mutex_id);
int ult_mutex_lock(tid_t mutex_id);
int ult_mutex_unlock(tid_t mutex_id);
int ult_mutex_destroy(tid_t mutex_id);

void display_deadlocks();

#endif