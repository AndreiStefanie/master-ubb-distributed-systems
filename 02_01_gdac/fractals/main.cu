#include "cuda_runtime.h"
#include "device_launch_parameters.h"

#include <stdio.h>
#include <iostream>

#include "util.h"

using namespace std;

__constant__ unsigned char d_colormap[(MAX_ITERATION + 1) * 3];

__global__ void generate_image(unsigned char* image, int width, int height, int max) {
	unsigned int x_dim = blockIdx.x * blockDim.x + threadIdx.x;
	unsigned int y_dim = blockIdx.y * blockDim.y + threadIdx.y;
	unsigned int index = 4 * width * y_dim + 4 * x_dim;

	double c_re = (x_dim - width / 2.0) * 4.0 / width;
	double c_im = (y_dim - height / 2.0) * 4.0 / width;

	double x = 0.0;
	double y = 0.0;

	unsigned int iteration = 0;

	while (x * x + y * y <= 4 && iteration < max) {
		double x_new = x * x - y * y + c_re;
		y = 2 * x * y + c_im;
		x = x_new;
		iteration++;
	}

	if (iteration > max) {
		iteration = max;
	}

	unsigned char* c = &d_colormap[iteration * 3];
	image[index + 0] = c[0];
	image[index + 1] = c[1];
	image[index + 2] = c[2];
	image[index + 3] = 255;
}

int main(int argc, char** argv) {
	struct timeb start, end;
	double times[REPEAT];
	char path[255];
	cudaError_t status = cudaSuccess;

	size_t colormap_size = (MAX_ITERATION + 1) * 3;
	size_t image_size = WIDTH * HEIGHT * 4;

	dim3 blockDim(THREADS_X, THREADS_Y, 1);
	dim3 gridDim(WIDTH / blockDim.x, HEIGHT / blockDim.y, 1);

	// Initialize the host image and colormap
	unsigned char* h_colormap = (unsigned char*)malloc(colormap_size);
	unsigned char* h_image = (unsigned char*)malloc(image_size);

	init_colormap(MAX_ITERATION, h_colormap);

	unsigned char* d_image;
	status = cudaMalloc((void**)&d_image, image_size);
	if (cudaSuccess != status) {
		fprintf(stderr, "cudaMalloc failed!");
		goto Error;
	}

	for (int i = 0; i < REPEAT; i++)
	{
		memset(h_image, 0, image_size);

		// Start the timer, including the copy of the image between the host and the device
		ftime(&start);

		status = cudaMemcpyToSymbol(d_colormap, h_colormap, colormap_size);
		if (cudaSuccess != status) {
			fprintf(stderr, "Failed to copy colormap to device");
			goto Error;
		}

		generate_image << <gridDim, blockDim >> > (d_image, WIDTH, HEIGHT, MAX_ITERATION);

		status = cudaGetLastError();
		if (cudaSuccess != status) {
			fprintf(stderr, "generate_image failed!");
			goto Error;
		}

		status = cudaDeviceSynchronize();
		if (cudaSuccess != status) {
			fprintf(stderr, "cudaDeviceSynchronize failed!");
			goto Error;
		}

		status = cudaMemcpy(h_image, d_image, image_size, cudaMemcpyDeviceToHost);
		if (cudaSuccess != status) {
			fprintf(stderr, "Failed to copy image back to host");
			goto Error;
		}

		ftime(&end);
		times[i] = end.time - start.time + ((double)end.millitm - (double)start.millitm) / 1000.0;

		sprintf(path, IMAGE, "gpu", i);
		save_image(path, h_image, WIDTH, HEIGHT);
		progress("gpu", i, times[i]);
	}

	report("gpu", times);

Error:
	free(h_image);
	free(h_colormap);
	cudaFree(d_image);

	return status;
}