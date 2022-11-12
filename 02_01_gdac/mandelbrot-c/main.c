#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <string.h>
#include <sys/timeb.h>

#include "tinycthread.h"
#include "util.h"

/* This should be conveted into a GPU kernel */
int generate_image(void* param) {
	int row, col, index, iteration;
	double c_re, c_im, x, y, x_new;

	struct arg* a = (struct arg*)param;

	unsigned char* image = a->image;
	unsigned char* colormap = a->colormap;
	int width = a->width;
	int height = a->height;
	int max = a->max;

	for (row = 0; row < height; row++) {
		for (col = 0; col < width; col++) {
			index = row * height + col;
			if (index % a->threads != a->id) {
				continue;
			}
			c_re = (col - width / 2.0) * 4.0 / width;
			c_im = (row - height / 2.0) * 4.0 / width;
			x = 0, y = 0;
			iteration = 0;
			while (x * x + y * y <= 4 && iteration < max) {
				x_new = x * x - y * y + c_re;
				y = 2 * x * y + c_im;
				x = x_new;
				iteration++;
			}
			if (iteration > max) {
				iteration = max;
			}
			set_pixel(image, width, col, row, &colormap[iteration * 3]);
		}
	}
	return 0;
}

int main(int argc, char** argv) {
	struct arg a[THREADS];
	thrd_t t[THREADS];
	double times[REPEAT];
	struct timeb start, end;
	int i, r;
	char path[255];

	unsigned char* colormap = (unsigned char*)malloc((MAX_ITERATION + 1) * 3);
	unsigned char* image = (unsigned char*)malloc(WIDTH * HEIGHT * 4);

	init_colormap(MAX_ITERATION, colormap);

	for (r = 0; r < REPEAT; r++) {
		memset(image, 0, WIDTH * HEIGHT * 4);

		ftime(&start);

		/* BEGIN: Thread-based implementation */
		/* Replace it with a GPU implementation. Modify in util.c the
		   progress(), description(), and report() functions to report
		   details specific to your GPU implementation (eg number of
		   blocks, numer of threads, optimization approach, etc */
		for (i = 0; i < THREADS; i++) {
			a[i].image = image;
			a[i].colormap = colormap;
			a[i].width = WIDTH;
			a[i].height = HEIGHT;
			a[i].max = MAX_ITERATION;
			a[i].id = i;
			a[i].threads = THREADS;

			thrd_create(&t[i], generate_image, &a[i]);
		}

		for (i = 0; i < THREADS; i++) {
			thrd_join(t[i], NULL);
		}
		/* END: Thread-based implementation */

		ftime(&end);
		times[r] = end.time - start.time + ((double)end.millitm - (double)start.millitm) / 1000.0;

		sprintf(path, IMAGE, "cpu", r);
		save_image(path, image, WIDTH, HEIGHT);
		progress("cpu", r, times[r]);
	}
	report("cpu", times);

	free(image);
	free(colormap);
	return 0;
}
