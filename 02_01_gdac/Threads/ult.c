#include "ult.h"

#include <signal.h>

static int thread_count = 0;

static ucontext_t scheduler_context;
static ult_t *main;

// Threads that are ready (not running)
static ult_t ready_list[MAX_THREADS_COUNT];

// All ULT threads
static ult_t threads_list[MAX_THREADS_COUNT];

static void scheduler_func() { raise(SIGPROF); }

void ult_init() {
  // Create the context for the thread scheduler
  if (-1 == getcontext(&scheduler_context)) {
    exit(EXIT_FAILURE);
  }
  scheduler_context.uc_stack.ss_sp = malloc(SIGSTKSZ);
  scheduler_context.uc_stack.ss_size = SIGSTKSZ;
  scheduler_context.uc_stack.ss_flags = 0;
  // Make the thread exit when the scheduler context ends
  scheduler_context.uc_link = NULL;
  makecontext(&scheduler_context, (void (*)(void)) & scheduler_func, 0);

  // Register main as an ULT thread
  main = (ult_t *)malloc(sizeof(ult_t));
  main->tid = allocate_tid();
  main->state = ULT_RUNNING;
  if (getcontext(&main->context) == -1) {
    exit(EXIT_FAILURE);
  }
  thread_count++;
}

int ult_create(pid_t *thread_id, void *(*start_routine)(void *), void *arg) {
  return 0;
}

int ult_join(tid_t thread_id, void **retval) { return 0; }

tid_t ult_self() { return 123; }

void ult_exit(void *retval) {}

void ult_yield(void) {}

static tid_t allocate_tid() {
  static tid_t next_tid = 2;
  tid_t tid;

  // lock_acquire(&tid_lock);
  tid = next_tid++;
  // lock_release(&tid_lock);

  return tid;
}

int _create_thread(ult_t *thread, state_t state, void *(*start_routine)(void *),
                   void *arg) {
  thread = (ult_t *)malloc(sizeof(ult_t));
  thread->tid = thread_count++;
  thread->state = state;
  if (getcontext(&thread->context) == -1) {
    exit(EXIT_FAILURE);
  }

  thread->context.uc_stack.ss_sp = malloc(SIGSTKSZ);
  thread->context.uc_stack.ss_size = SIGSTKSZ;
  thread->context.uc_stack.ss_flags = 0;
  thread->context.uc_link = &scheduler_context;

  makecontext(&thread->context, start_routine, 0);
}