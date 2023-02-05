#include "ult.h"

#include <signal.h>
#include <stdio.h>
#include <sys/time.h>

#include "mutex.h"
#include "util.h"

#define SIGNAL SIGALRM

struct itimerval timer;
struct sigaction alarm;

static size_t thread_count = 0;
static ult_t *running = NULL;

static ucontext_t *main_context;

// All ULT threads
static ult_t threads_list[MAX_THREADS_COUNT];

static ult_t *_get_next_ready_thread() {
  tid_t next_tid;
  bool found = false;

  for (size_t i = 1; i < thread_count && !found; i++) {
    // Round robin
    size_t t_index = (running->tid + i) % thread_count;
    if (ULT_READY == threads_list[t_index].state) {
      found = true;
      next_tid = t_index;
    }
  }

  return &threads_list[next_tid];
}

void _ult_schedule(int signum) {
  // No threads left
  if (0 == thread_count) {
    exit(0);
  }

  block_signals();
  ult_t *current_th = running;
  running = _get_next_ready_thread();
  unblock_signals();
  swapcontext(&current_th->context, &running->context);
}

static int _init_profiling_timer(long quantum) {
  alarm.sa_handler = &_ult_schedule;
  sigemptyset(&alarm.sa_mask);
  sigaddset(&alarm.sa_mask, SIGNAL);
  // https://stackoverflow.com/a/71140822
  sigaddset(&alarm.sa_mask, SA_RESTART);

  struct sigaction old;
  if (sigaction(SIGNAL, &alarm, &old) == -1) {
    perror("sigaction");
    return EXIT_FAILURE;
  }

  timer.it_interval.tv_sec = 0;
  timer.it_interval.tv_usec = quantum;
  timer.it_value.tv_sec = 0;
  timer.it_value.tv_usec = quantum;  // If the value is to small, the timer will
                                     // fire before finishing this function

  // Enable timer
  if (setitimer(ITIMER_REAL, &timer, NULL) == -1) {
    if (sigaction(SIGNAL, &old, NULL) == -1) {
      perror("sigaction");
    }

    return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}

static inline char *get_state_name(state_t s) {
  static char *names[] = {"blocked", "ready", "terminated"};

  return names[s];
}

void _display_handler(int signo) {
  block_signals();

  // Display all created threads
  printf("\n___________________Threads___________________\n");
  for (size_t i = 0; i < thread_count; i++) {
    printf("Thread %lu %s\n", threads_list[i].tid,
           get_state_name(threads_list[i].state));
  }
  printf("_____________________________________________\n");

  display_deadlocks();

  unblock_signals();
}

static int _init_display_signal_handler() {
  struct sigaction sa;

  sa.sa_handler = _display_handler;
  sigemptyset(&sa.sa_mask);
  sa.sa_flags = SA_RESTART;  // Restart functions if interrupted by handler

  // SIGTSTP is CTRL+Z
  if (sigaction(SIGTSTP, &sa, NULL) == -1) {
    perror("sigaction");
    return EXIT_FAILURE;
  }

  return EXIT_SUCCESS;
}

/**
 * Wrapper function that stores the return value from the routine executed by
 * the current thread
 */
static void _ult_wrapper() {
  block_signals();
  ult_t *t = running;
  unblock_signals();

  void *result = t->start_routine(t->arg);
  ult_exit(result);
}

ult_t *_init_next_thread(state_t state) {
  // No allocation needed since we are using a static array
  // thread = (ult_t *)malloc(sizeof(ult_t));
  ult_t *t = &threads_list[thread_count];
  t->tid = thread_count;
  t->state = state;
  if (getcontext(&t->context) == -1) {
    exit(EXIT_FAILURE);
  }

  thread_count++;

  return t;
}

ult_t *_create_thread(state_t state, void *(*start_routine)(void *),
                      void *arg) {
  ult_t *t = _init_next_thread(state);

  t->context.uc_stack.ss_sp = malloc(SIGSTKSZ);
  t->context.uc_stack.ss_size = SIGSTKSZ;
  t->context.uc_stack.ss_flags = 0;
  t->context.uc_link = main_context;
  makecontext(&t->context, (void (*)(void))_ult_wrapper, 0);

  t->start_routine = start_routine;
  t->arg = arg;

  return t;
}

int ult_init(long quantum) {
  // Register main as an ULT thread
  running = _init_next_thread(ULT_READY);
  main_context = &running->context;

  int status = _init_profiling_timer(quantum);
  if (EXIT_SUCCESS != status) {
    return status;
  }

  status = _init_display_signal_handler();
  if (EXIT_SUCCESS != status) {
    return status;
  }

  return EXIT_SUCCESS;
}

int ult_create(tid_t *thread_id, void *(*start_routine)(void *), void *arg) {
  if (MAX_THREADS_COUNT - 1 == thread_count) {
    // Max number of threads reached
    return EXIT_FAILURE;
  }

  block_signals();
  *thread_id = _create_thread(ULT_READY, start_routine, arg)->tid;
  unblock_signals();

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

tid_t ult_self() { return running->tid; }

void ult_exit(void *retval) {
  block_signals();
  running->retval = retval;
  running->state = ULT_TERMINATED;
  unblock_signals();

  ult_yield();
}
