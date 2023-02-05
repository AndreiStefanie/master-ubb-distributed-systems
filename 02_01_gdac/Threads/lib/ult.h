#ifndef ULT_H
#define ULT_H

#ifdef __APPLE__
// ucontext.h is deprecated on macOS, so tests that include it may stop working
// someday. We define _XOPEN_SOURCE to keep using ucontext.h for now.
#define _XOPEN_SOURCE 700
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
#endif

#include <stdbool.h>
#include <stdlib.h>
#include <ucontext.h>

#define MAX_THREADS_COUNT 1000

typedef enum state_t { ULT_BLOCKED, ULT_READY, ULT_TERMINATED } state_t;

typedef unsigned long int tid_t;

typedef struct ult_t {
  // The ID of the thread
  tid_t tid;

  // The context (stack, etc) of the thread
  ucontext_t context;

  state_t state;
  void *(*start_routine)(void *);
  void *arg;
  void *retval;
} ult_t;

/**
 * Initialize the ULT library.
 * @param quantum The quantum of time each thread will receive from the
 * scheduler. Specified in microseconds
 */
int ult_init(long quantum);

/**
 * Create an UTL thread (stored in the reference given by the first parameter)
 * that will run the function provided as the second
 * parameter with the args provided as the 3rd.
 *
 * Similar to https://man7.org/linux/man-pages/man3/pthread_create.3.html
 */
int ult_create(tid_t *thread_id, void *(*start_routine)(void *), void *arg);

/**
 * Wait for the given thread to terminate.
 *
 * Similar to https://man7.org/linux/man-pages/man3/pthread_join.3.html
 */
int ult_join(tid_t thread_id, void **retval);

/**
 * Get the ID of the calling thread
 *
 * Similar to https://man7.org/linux/man-pages/man3/pthread_self.3.html
 */
tid_t ult_self();

void ult_exit(void *retval);

void ult_yield(void);

#endif