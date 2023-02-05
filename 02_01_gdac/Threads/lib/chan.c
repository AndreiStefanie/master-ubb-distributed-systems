#include "chan.h"

#include <errno.h>
#include <string.h>

#include "util.h"

static ult_chan_t channels[100];
static size_t count = 0;

int ult_chan_init(tid_t* chan_id, size_t capacity) {
  ult_chan_t* c = &channels[count];

  c->id = count;
  c->capacity = capacity;
  c->closed = false;
  c->buf = (void**)malloc(capacity * sizeof(void*));
  if (!c->buf) {
    errno = ENOMEM;
    return EXIT_FAILURE;
  }

  ult_mutex_init(&c->w_mutex);
  ult_mutex_init(&c->r_mutex);
  c->r_waiting = false;
  c->w_waiting = false;

  *chan_id = count;

  count++;
  return EXIT_SUCCESS;
}

int ult_chan_write(tid_t chan_id, void* buf, size_t length) {
  ult_chan_t* c = &channels[chan_id];

  if (chan_id >= count || c->closed) {
    errno = EPIPE;
    return EXIT_FAILURE;
  }

  ult_mutex_lock(c->w_mutex);

  while (length > c->capacity - c->size) {
    // Block until enough space is available
    c->w_waiting = true;
    ult_yield();
  }

  c->w_waiting = false;
  void* target = c->buf + c->size;
  memcpy(target, buf, length);
  c->size += length;

  if (c->r_waiting) {
    // Notify readers?
    // Would work nicely with a conditional variable
  }

  ult_mutex_unlock(c->w_mutex);

  return EXIT_SUCCESS;
}

int ult_chan_read(tid_t chan_id, void* buf, size_t length) {
  ult_chan_t* c = &channels[chan_id];

  if (chan_id >= count || c->closed) {
    errno = EPIPE;
    return EXIT_FAILURE;
  }

  ult_mutex_lock(c->r_mutex);

  while (length > c->size) {
    // Wait until enough data is available
    c->r_waiting = true;
    ult_yield();
  }

  c->r_waiting = false;

  // Copy the data to the output
  memcpy(buf, c->buf, length);

  if (c->size > length) {
    // Move the remaining data to the beginning of the buffer
    block_signals();
    void* source = c->buf + length;
    void* tmp = malloc((c->size - length) * sizeof(void*));
    memcpy(tmp, source, c->size - length);
    memcpy(c->buf, tmp, c->size - length);
    unblock_signals();
  }

  c->size -= length;

  if (c->w_waiting) {
    // Notify writers?
    // Would work nicely with a conditional variable
  }

  ult_mutex_unlock(c->r_mutex);

  return EXIT_SUCCESS;
}
