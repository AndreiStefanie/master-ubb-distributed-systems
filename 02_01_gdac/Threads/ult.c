#include "ult.h"

#include <signal.h>
#include <stdio.h>
#include <sys/time.h>

struct sigaction timer_handler;
struct itimerval timer;
sigset_t sigset;

static size_t thread_count = 0;
static size_t current_thread = -1;

static ucontext_t scheduler_context;

// All ULT threads
static ult_t threads_list[MAX_THREADS_COUNT];

static tid_t _get_next_ready_thread() {
  tid_t next_tid;
  bool found = false;

  for (size_t i = 1; i < thread_count && !found; i++) {
    // Round robin
    size_t t_index = (current_thread + i) % thread_count;
    if (ULT_READY == threads_list[t_index].state) {
      found = true;
      next_tid = t_index;
    }
  }

  return next_tid;
}

static void _ult_schedule() {
  // No threads left
  if (0 == thread_count) {
    exit(0);
  }

  ult_t *current_th = &threads_list[current_thread];
  current_thread = _get_next_ready_thread();
  ult_t *next_th = &threads_list[current_thread];
  swapcontext(&current_th->context, &next_th->context);
}

// static void _ult_timer() { raise(SIGPROF); }

/**
 * Wrapper function that stores the return value from the routine executed by
 * the current thread
 */
static void _ult_wrapper(void *(*start_routine)(void *), void *arg) {
  sigprocmask(SIG_BLOCK, &sigset, NULL);
  ult_t *t = &threads_list[current_thread];
  t->retval = (*start_routine)(arg);
  t->state = ULT_TERMINATED;
  sigprocmask(SIG_UNBLOCK, &sigset, NULL);
}

tid_t _init_next_thread(state_t state) {
  // No allocation needed since we are using a static array
  // thread = (ult_t *)malloc(sizeof(ult_t));
  ult_t *t = &threads_list[thread_count];
  t->tid = thread_count;
  t->state = state;
  if (getcontext(&t->context) == -1) {
    exit(EXIT_FAILURE);
  }

  thread_count++;

  return t->tid;
}

tid_t _create_thread(state_t state, void *(*start_routine)(void *), void *arg) {
  tid_t tid = _init_next_thread(state);
  ult_t *t = &threads_list[tid];

  t->context.uc_stack.ss_sp = malloc(SIGSTKSZ);
  t->context.uc_stack.ss_size = SIGSTKSZ;
  t->context.uc_stack.ss_flags = 0;
  t->context.uc_link = &scheduler_context;

  makecontext(&t->context, (void (*)(void))_ult_wrapper, 2, start_routine, arg);

  return tid;
}

int ult_init(long quantum) {
  // Create the context for the thread scheduler
  if (-1 == getcontext(&scheduler_context)) {
    exit(EXIT_FAILURE);
  }
  // scheduler_context.uc_stack.ss_sp = malloc(SIGSTKSZ);
  // scheduler_context.uc_stack.ss_size = SIGSTKSZ;
  // scheduler_context.uc_stack.ss_flags = 0;
  // // Exit when the scheduler context ends
  // scheduler_context.uc_link = NULL;
  // makecontext(&scheduler_context, (void (*)(void)) & _ult_timer, 0);

  // Set up the scheduler - basically a signal handler called every `quantum`ms
  sigemptyset(&sigset);
  sigaddset(&sigset, SIGPROF);
  timer_handler.sa_handler = &_ult_schedule;
  sigemptyset(&timer_handler.sa_mask);
  sigaddset(&timer_handler.sa_mask, SIGPROF);
  sigaction(SIGPROF, &timer_handler, NULL);
  timer.it_interval.tv_sec = quantum / 1000000;
  timer.it_interval.tv_usec = quantum;
  timer.it_value = timer.it_interval;

  // Register main as an ULT thread
  current_thread = _init_next_thread(ULT_RUNNING);

  // Start the scheduler timer
  return setitimer(ITIMER_PROF, &timer, NULL);
}

int ult_create(pid_t *thread_id, void *(*start_routine)(void *), void *arg) {
  if (MAX_THREADS_COUNT - 1 == thread_count) {
    // Max number of threads reached
    return EXIT_FAILURE;
  }

  sigprocmask(SIG_BLOCK, &sigset, NULL);
  *thread_id = _create_thread(ULT_READY, start_routine, arg);
  sigprocmask(SIG_UNBLOCK, &sigset, NULL);

  return 0;
}

void ult_yield() { raise(SIGPROF); }

int ult_join(tid_t thread_id, void **retval) {
  ult_t *t = &threads_list[thread_id];
  while (ULT_TERMINATED != t->state) {
    ult_yield();
  }

  if (NULL != retval) {
    *retval = t->retval;
  }

  return 0;
}

tid_t ult_self() { return threads_list[current_thread].tid; }

void ult_exit(void *retval) {
  sigprocmask(SIG_BLOCK, &sigset, NULL);
  ult_t *t = &threads_list[current_thread];
  t->retval = retval;
  t->state = ULT_TERMINATED;
  sigprocmask(SIG_UNBLOCK, &sigset, NULL);

  ult_yield();
}
