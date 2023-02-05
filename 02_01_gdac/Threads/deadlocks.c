#include <errno.h>
#include <stdio.h>
#include <string.h>
#include <time.h>
#include <unistd.h>

#include "lib/mutex.h"
#include "lib/ult.h"
#include "lib/util.h"

#define MAX_SLEEP 5

tid_t m1;
tid_t m2;

void* f1(void* arg) {
  int random_time;

  while (1) {
    srand(time(NULL));
    random_time = rand() % MAX_SLEEP;
    printf("[%s]Sleeping for %d seconds\n", __FUNCTION__, random_time);
    ms_sleep(random_time * 1000);
    printf("[%s]Trying to acquire mutex1 (holding none)\n", __FUNCTION__);
    ult_mutex_lock(m1);
    printf("[%s]Acquired mutex1\n", __FUNCTION__);

    random_time = rand() % MAX_SLEEP;
    printf("[%s]Sleeping for %d seconds\n", __FUNCTION__, random_time);
    sleep(random_time);

    printf("[%s]Trying to acquire mutex2 (holding mutex1) \n", __FUNCTION__);
    ult_mutex_lock(m2);
    printf("[%s]Acquired mutex2\n\n", __FUNCTION__);

    ult_mutex_unlock(m2);
    ult_mutex_unlock(m1);
  }

  return NULL;
}

void* f2(void* arg) {
  int random_time;

  while (1) {
    srand(time(NULL));
    random_time = rand() % MAX_SLEEP;
    printf("[%s]Sleeping for %d seconds\n", __FUNCTION__, random_time);
    ms_sleep(random_time * 1000);
    printf("[%s]Trying to acquire mutex2 (holding none)\n", __FUNCTION__);
    ult_mutex_lock(m2);
    printf("[%s]Acquired mutex2\n", __FUNCTION__);

    random_time = rand() % MAX_SLEEP;
    printf("[%s]Sleeping for %d seconds\n", __FUNCTION__, random_time);
    sleep(random_time);

    printf("[%s]Trying to acquire mutex1 (holding mutex2) \n", __FUNCTION__);
    ult_mutex_lock(m1);
    printf("[%s]Acquired mutex1\n\n", __FUNCTION__);

    ult_mutex_unlock(m1);
    ult_mutex_unlock(m2);
  }
  return NULL;
}

int main() {
  tid_t t1;
  tid_t t2;

  int status = ult_init(100000);
  if (0 != status) {
    printf("Failed to initialize the ULT lib: %s\n", strerror(errno));
    exit(status);
  }

  status = ult_mutex_init(&m1);
  if (0 != status) {
    printf("Failed to initialize the ULT mutex: %s\n", strerror(errno));
    exit(status);
  }

  status = ult_mutex_init(&m2);
  if (0 != status) {
    printf("Failed to initialize the ULT mutex: %s\n", strerror(errno));
    exit(status);
  }

  status = ult_create(&t1, &f1, NULL);
  if (0 != status) {
    printf("Failed to create the ULT thread: %s\n", strerror(errno));
    exit(status);
  }

  status = ult_create(&t2, &f2, NULL);
  if (0 != status) {
    printf("Failed to create the ULT thread: %s\n", strerror(errno));
    exit(status);
  }

  status = ult_join(t1, NULL);
  if (0 != status) {
    printf("Failed to join the ULT thread: %s\n", strerror(errno));
    exit(status);
  }

  status = ult_join(t2, NULL);
  if (0 != status) {
    printf("Failed to join the ULT thread: %s\n", strerror(errno));
    exit(status);
  }

  return 0;
}