#include "ult.h"

#include <signal.h>
#include <stdio.h>
#include <sys/time.h>

#define SIGNAL SIGPROF

struct itimerval timer;

static size_t thread_count = 0;
static size_t current_tid = -1;

static ucontext_t *main_context;

// All ULT threads
static ult_t threads_list[MAX_THREADS_COUNT];

static void _block_sigprof() {
  sigset_t sigprof;
  sigemptyset(&sigprof);
  sigaddset(&sigprof, SIGNAL);

  if (sigprocmask(SIG_BLOCK, &sigprof, NULL) == -1) {
    perror("sigprocmask");
    abort();
  }
}

static void _unblock_sigprof() {
  sigset_t sigprof;
  sigemptyset(&sigprof);
  sigaddset(&sigprof, SIGNAL);

  if (sigprocmask(SIG_UNBLOCK, &sigprof, NULL) == -1) {
    perror("sigprocmask");
    abort();
  }
}

static tid_t _get_next_ready_thread() {
  tid_t next_tid;
  bool found = false;

  for (size_t i = 1; i < thread_count && !found; i++) {
    // Round robin
    size_t t_index = (current_tid + i) % thread_count;
    if (ULT_READY == threads_list[t_index].state) {
      found = true;
      next_tid = t_index;
    }
  }

  return next_tid;
}

static void _ult_schedule(int signum, siginfo_t *nfo, void *context) {
  // No threads left
  if (0 == thread_count) {
    exit(0);
  }

  _block_sigprof();
  ult_t *current_th = &threads_list[current_tid];
  current_tid = _get_next_ready_thread();
  ult_t *next_th = &threads_list[current_tid];
  _unblock_sigprof();
  swapcontext(&current_th->context, &next_th->context);
}

static bool _init_profiling_timer(long quantum) {
  // Install signal handler
  sigset_t all;
  sigfillset(&all);

  const struct sigaction alarm = {.sa_sigaction = _ult_schedule,
                                  .sa_mask = all,
                                  .sa_flags = SA_SIGINFO | SA_RESTART};

  struct sigaction old;

  if (sigaction(SIGNAL, &alarm, &old) == -1) {
    perror("sigaction");
    abort();
  }

  const struct itimerval timer = {
      {0, quantum}, {0, 1}  // arms the timer as soon as possible
  };

  // Enable timer
  if (setitimer(ITIMER_PROF, &timer, NULL) == -1) {
    if (sigaction(SIGNAL, &old, NULL) == -1) {
      perror("sigaction");
      abort();
    }

    return false;
  }

  return true;
}

/**
 * Wrapper function that stores the return value from the routine executed by
 * the current thread
 */
static void _ult_wrapper() {
  _block_sigprof();
  ult_t *t = &threads_list[current_tid];
  _unblock_sigprof();

  void *result = t->start_routine(t->arg);
  ult_exit(result);
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
  t->context.uc_link = main_context;
  makecontext(&t->context, (void (*)(void))_ult_wrapper, 0);

  t->start_routine = start_routine;
  t->arg = arg;

  return tid;
}

int ult_init(long quantum) {
  _init_profiling_timer(quantum);

  // Register main as an ULT thread
  current_tid = _init_next_thread(ULT_READY);
  main_context = &threads_list[current_tid].context;

  return setitimer(ITIMER_REAL, &timer, NULL);
}

int ult_create(tid_t *thread_id, void *(*start_routine)(void *), void *arg) {
  if (MAX_THREADS_COUNT - 1 == thread_count) {
    // Max number of threads reached
    return EXIT_FAILURE;
  }

  _block_sigprof();
  *thread_id = _create_thread(ULT_READY, start_routine, arg);
  _unblock_sigprof();

  return 0;
}

void ult_yield() { raise(SIGNAL); }

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

tid_t ult_self() { return threads_list[current_tid].tid; }

void ult_exit(void *retval) {
  _block_sigprof();
  ult_t *t = &threads_list[current_tid];
  t->retval = retval;
  t->state = ULT_TERMINATED;
  // thread_count--;
  _unblock_sigprof();

  ult_yield();
}
