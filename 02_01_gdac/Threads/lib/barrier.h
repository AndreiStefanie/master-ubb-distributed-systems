#ifndef ULT_BARRIER_H
#define ULT_BARRIER_H
#include "ult.h"

typedef struct ult_barrier_t {
  int id;
  size_t count;
  size_t current_count;
} ult_barrier_t;

int ult_barrier_init(tid_t *barrier_id, size_t count);
int ult_barrier_wait(tid_t barrier_id);
int ult_barrier_destroy(tid_t barrier_id);

#endif