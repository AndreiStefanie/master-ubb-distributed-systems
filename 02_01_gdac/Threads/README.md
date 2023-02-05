# User-Level Threads Library

This project constitutes a minimal emulation of the [pthreads library](https://en.wikipedia.org/wiki/Pthreads).

It supports:

- `ult_init` - Must be called before any other function. Sets up the scheduler and signal handlers. You provide the quantum of time the scheduler will allow each thread to run (in microseconds).
- `ult_create` - Similar to [pthread_create](https://en.wikipedia.org/wiki/Pthreads)
- `ult_join` - Similar to [pthread_join](https://man7.org/linux/man-pages/man3/pthread_join.3.html)
- `ult_self` - Similar to [pthread_self](https://man7.org/linux/man-pages/man3/pthread_self.3.html)
- `ult_yield` - Similar to [pthread_yield](https://man7.org/linux/man-pages/man3/pthread_yield.3.html)
- `ult_mutex_init` - Similar to [pthread_mutex_init](https://linux.die.net/man/3/pthread_mutex_init). However, it set only the mutex id in the first parameter, not the entire mutex structure.
- `ult_mutex_lock` - Similar to [pthread_mutex_lock](https://linux.die.net/man/3/pthread_mutex_lock)
- `ult_mutex_unlock` - Similar to [pthread_mutex_unlock](https://linux.die.net/man/3/pthread_mutex_unlock)
- `ult_mutex_destroy` - Similar to [pthread_mutex_destroy](https://linux.die.net/man/3/pthread_mutex_destroy)
- `ult_barrier_init` - Similar to [pthread_barrier_init](https://linux.die.net/man/3/pthread_barrier_init)
- `ult_barrier_wait` - Similar to [pthread_barrier_wait](https://linux.die.net/man/3/pthread_barrier_wait)
- `ult_barrier_destroy` - Similar to [pthread_barrier_destroy](https://linux.die.net/man/3/pthread_barrier_destroy)

### Threads Extensions

The extensions add the following features:

- Posibility to display the running threads and the deadlocks, if any. Press CTRL+Z during the program execution.
- Bufferd channels. `ult_chan_init`, `ult_chan_write`, `ult_chan_read`. Read the comments from [chan.h](./lib/chan.h).

## Technical Details

The implementation leverages signals (`SIGALRM`) triggered through a timer (see [setitimer](https://linux.die.net/man/2/setitimer)) that fires based on the provided time quantum. Other alternatives to `SIGALRM` are `SIGVTALRM` and `SIGPROF` (see [here](https://www.gnu.org/software/libc/manual/html_node/Alarm-Signals.html)). However, using any of those two lead to issues when using `sleep` because they rely on the virtual clock of the CPU.

The scheduling of the threads is performed in round-robin fashion.

For simplicity, the library uses an array so it can handle up to 1000 threads. Ideally, we would use a linked-list.
