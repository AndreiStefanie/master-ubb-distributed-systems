
#include "lib/chan.h"

#include <errno.h>
#include <stdio.h>
#include <string.h>
#include <time.h>
#include <unistd.h>

#include "lib/ult.h"
#include "lib/util.h"

#define MAX_SLEEP 5

tid_t c1;

void* f1(void* arg) {
  // Fill in channel 1
  ms_sleep(500);
  char* data = "abcdefghijklmnopqrstuvwxyz";
  int status = ult_chan_write(c1, data, 26);
  if (EXIT_SUCCESS != status) {
    printf("Failed to write to channel: %s\n", strerror(errno));
    return NULL;
  }
  printf("[%s] Wrote all data to channel\n", __FUNCTION__);

  return NULL;
}

void* f2(void* arg) {
  // Also try to write to channel 1
  ms_sleep(2000);
  char* data = "zyxwvutsrqponmlkjihgfedcba";
  int status = ult_chan_write(c1, data, 26);
  if (EXIT_SUCCESS != status) {
    printf("Failed to write to channel: %s", strerror(errno));
    return NULL;
  }
  printf("[%s] Wrote all data to channel\n", __FUNCTION__);

  return NULL;
}

void* f3(void* arg) {
  // Read some bits from channel 1
  char data[27];
  int status = ult_chan_read(c1, &data, 10);
  if (EXIT_SUCCESS != status) {
    printf("Failed to read from the channel: %s\n", strerror(errno));
    return NULL;
  }
  data[10] = '\0';
  printf("[%s] Read the first 10 bytes from the buffer: %s\n", __FUNCTION__,
         data);

  // Wait some more time and read the rest of the data from channel 1
  ms_sleep(5000);

  void* target = (void*)(data + 10);
  status = ult_chan_read(c1, target, 16);
  if (EXIT_SUCCESS != status) {
    printf("Failed to read from the channel: %s\n", strerror(errno));
    return NULL;
  }
  data[26] = '\0';
  printf("[%s] Read the rest of the data from the buffer: %s\n", __FUNCTION__,
         data);

  // Read the data written by the second thread
  status = ult_chan_read(c1, &data, 26);
  if (EXIT_SUCCESS != status) {
    printf("Failed to read from the channel: %s\n", strerror(errno));
    return NULL;
  }
  data[26] = '\0';
  printf("[%s] Read data from thread 2: %s\n", __FUNCTION__, data);

  return NULL;
}

int main() {
  tid_t t1;
  tid_t t2;
  tid_t t3;

  int status = ult_init(100000);
  if (0 != status) {
    printf("Failed to initialize the ULT lib: %s\n", strerror(errno));
    exit(status);
  }

  status = ult_chan_init(&c1, 26);
  if (0 != status) {
    printf("Failed to initialize the ULT channel: %s\n", strerror(errno));
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

  status = ult_create(&t3, &f3, NULL);
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

  status = ult_join(t3, NULL);
  if (0 != status) {
    printf("Failed to join the ULT thread: %s\n", strerror(errno));
    exit(status);
  }

  return 0;
}