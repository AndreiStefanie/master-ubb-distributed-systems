#include <stdio.h>

#include "ult.h"

#define THREAD_COUNT 10

void* f(void* arg) {
  for (size_t i = 0; i < 100; i++) {
    printf("Hello from thread %lu (%lu)", ult_self(), i);
  }

  return NULL;
}

int main() {
  pid_t threads[THREAD_COUNT];

  ult_init();

  for (size_t i = 0; i < THREAD_COUNT; i++) {
    ult_create(&threads[i], &f, NULL);
  }

  for (size_t i = 0; i < THREAD_COUNT; i++) {
    ult_join(threads[i], NULL);
  }

  return 0;
}