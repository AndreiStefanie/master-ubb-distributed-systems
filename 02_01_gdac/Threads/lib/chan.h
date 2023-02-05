#ifndef ULT_CHAN_H
#define ULT_CHAN_H
#include "mutex.h"
#include "ult.h"

typedef struct ult_chan_t {
  tid_t id;
  // The allocated capacity
  size_t capacity;

  // The current size. This also acts as the cursor where the data will be
  // written
  size_t size;

  // The data
  void *buf;

  // Closed or not
  bool closed;

  // Mutex for writing data
  tid_t w_mutex;

  // Mutex for reading data
  tid_t r_mutex;

  bool r_waiting;
  bool w_waiting;
} ult_chan_t;

/**
 * @brief Initialize a new channel with the specified buffering capacity
 * @param chan_id Set by the function
 * @param capacity The buffering capacity
 * @return
 */
int ult_chan_init(tid_t *chan_id, size_t capacity);

/**
 * @brief Write to the channel. If not enough capacity is avaiable, the thread
 * will wait.
 * @param chan_id The channel
 * @param buf The data
 * @param length The length of the data
 * @return
 */
int ult_chan_write(tid_t chan_id, void *buf, size_t length);

/**
 * @brief Read from the channel. If not enough data is available, the thread
 * will wait.
 * @param chan_id The channel
 * @param buf Where the data will be stored
 * @param length The requested data size
 * @return
 */
int ult_chan_read(tid_t chan_id, void *buf, size_t length);

#endif