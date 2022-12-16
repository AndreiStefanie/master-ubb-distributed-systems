#include "cuda_runtime.h"
#include "device_launch_parameters.h"

#include <stdint.h>

#include "config.h"
#include "fmt.h"

// SHA1 Implementation
typedef struct {
	BYTE data[64];
	WORD datalen;
	LONG bitlen;
	WORD state[5];
	WORD k[4];
} CUDA_SHA1_CTX;

#ifndef ROTLEFT
#define ROTLEFT(a,b) (((a) << (b)) | ((a) >> (32-(b))))
#endif

__device__  __forceinline__ void cuda_sha1_transform(CUDA_SHA1_CTX* ctx, const BYTE data[])
{
	WORD a, b, c, d, e, i, j, t, m[80];

	for (i = 0, j = 0; i < 16; ++i, j += 4)
		m[i] = (data[j] << 24) + (data[j + 1] << 16) + (data[j + 2] << 8) + (data[j + 3]);
	for (; i < 80; ++i) {
		m[i] = (m[i - 3] ^ m[i - 8] ^ m[i - 14] ^ m[i - 16]);
		m[i] = (m[i] << 1) | (m[i] >> 31);
	}

	a = ctx->state[0];
	b = ctx->state[1];
	c = ctx->state[2];
	d = ctx->state[3];
	e = ctx->state[4];

	for (i = 0; i < 20; ++i) {
		t = ROTLEFT(a, 5) + ((b & c) ^ (~b & d)) + e + ctx->k[0] + m[i];
		e = d;
		d = c;
		c = ROTLEFT(b, 30);
		b = a;
		a = t;
	}
	for (; i < 40; ++i) {
		t = ROTLEFT(a, 5) + (b ^ c ^ d) + e + ctx->k[1] + m[i];
		e = d;
		d = c;
		c = ROTLEFT(b, 30);
		b = a;
		a = t;
	}
	for (; i < 60; ++i) {
		t = ROTLEFT(a, 5) + ((b & c) ^ (b & d) ^ (c & d)) + e + ctx->k[2] + m[i];
		e = d;
		d = c;
		c = ROTLEFT(b, 30);
		b = a;
		a = t;
	}
	for (; i < 80; ++i) {
		t = ROTLEFT(a, 5) + (b ^ c ^ d) + e + ctx->k[3] + m[i];
		e = d;
		d = c;
		c = ROTLEFT(b, 30);
		b = a;
		a = t;
	}

	ctx->state[0] += a;
	ctx->state[1] += b;
	ctx->state[2] += c;
	ctx->state[3] += d;
	ctx->state[4] += e;
}

__device__ void cuda_sha1_init(CUDA_SHA1_CTX* ctx)
{
	ctx->datalen = 0;
	ctx->bitlen = 0;
	ctx->state[0] = 0x67452301;
	ctx->state[1] = 0xEFCDAB89;
	ctx->state[2] = 0x98BADCFE;
	ctx->state[3] = 0x10325476;
	ctx->state[4] = 0xc3d2e1f0;
	ctx->k[0] = 0x5a827999;
	ctx->k[1] = 0x6ed9eba1;
	ctx->k[2] = 0x8f1bbcdc;
	ctx->k[3] = 0xca62c1d6;
}

__device__ void cuda_sha1_update(CUDA_SHA1_CTX* ctx, const BYTE data[], size_t len)
{
	size_t i;

	for (i = 0; i < len; ++i) {
		ctx->data[ctx->datalen] = data[i];
		ctx->datalen++;
		if (ctx->datalen == 64) {
			cuda_sha1_transform(ctx, ctx->data);
			ctx->bitlen += 512;
			ctx->datalen = 0;
		}
	}
}

__device__ void cuda_sha1_final(CUDA_SHA1_CTX* ctx, BYTE hash[])
{
	WORD i;

	i = ctx->datalen;

	// Pad whatever data is left in the buffer.
	if (ctx->datalen < 56) {
		ctx->data[i++] = 0x80;
		while (i < 56)
			ctx->data[i++] = 0x00;
	}
	else {
		ctx->data[i++] = 0x80;
		while (i < 64)
			ctx->data[i++] = 0x00;
		cuda_sha1_transform(ctx, ctx->data);
		memset(ctx->data, 0, 56);
	}

	// Append to the padding the total message's length in bits and transform.
	ctx->bitlen += ctx->datalen * 8;
	ctx->data[63] = ctx->bitlen;
	ctx->data[62] = ctx->bitlen >> 8;
	ctx->data[61] = ctx->bitlen >> 16;
	ctx->data[60] = ctx->bitlen >> 24;
	ctx->data[59] = ctx->bitlen >> 32;
	ctx->data[58] = ctx->bitlen >> 40;
	ctx->data[57] = ctx->bitlen >> 48;
	ctx->data[56] = ctx->bitlen >> 56;
	cuda_sha1_transform(ctx, ctx->data);

	// Since this implementation uses little endian byte ordering and MD uses big endian,
	// reverse all the bytes when copying the final state to the output hash.
	for (i = 0; i < 4; ++i) {
		hash[i] = (ctx->state[0] >> (24 - i * 8)) & 0x000000ff;
		hash[i + 4] = (ctx->state[1] >> (24 - i * 8)) & 0x000000ff;
		hash[i + 8] = (ctx->state[2] >> (24 - i * 8)) & 0x000000ff;
		hash[i + 12] = (ctx->state[3] >> (24 - i * 8)) & 0x000000ff;
		hash[i + 16] = (ctx->state[4] >> (24 - i * 8)) & 0x000000ff;
	}
}

__device__ BYTE* d_strcpy(BYTE* dest, BYTE* src) {
	int i = 0;

	do {
		dest[i] = src[i];
	} while (src[i++] != 0);

	return dest;
}

__device__ void d_reverse(BYTE str[], int size)
{
	int start = 0;
	int end = size - 1;
	while (start < end) {
		char h = *(str + start), t = *(str + end);
		*(str + start) = t;
		*(str + end) = h;
		start++;
		end--;
	}
}

__device__ BYTE* d_itob(size_t num, BYTE* str, int* size)
{
	int i = 0;

	/* Handle 0 explicitely, otherwise empty string is printed for 0 */
	if (num == 0) {
		str[i++] = '0';
		return str;
	}

	// Process individual digits 
	while (num != 0) {
		int rem = num % 10;
		str[i++] = (rem > 9) ? (rem - 10) + 'a' : rem + '0';
		num = num / 10;
	}

	// Reverse the string 
	d_reverse(str, i);
	*size = i;

	return str;
}

__device__ BYTE* d_strcat(BYTE* dest, BYTE* src) {
	int i = 0;

	while (dest[i] != 0) {
		i++;
	}
	d_strcpy(dest + i, src);

	return dest;
}

__device__ void makedigits(BYTE x, BYTE(&digits)[2])
{
	BYTE d0 = x / 16;
	digits[1] = x - d0 * 16;
	BYTE d1 = d0 / 16;
	digits[0] = d0 - d1 * 16;
}

__device__ void makehex(BYTE(&digits)[2], char(&hex)[2])
{
	for (int i = 0; i < 2; ++i) {
		if (digits[i] < 10) {
			hex[i] = '0' + digits[i];
		}
		else {
			hex[i] = 'a' + (digits[i] - 10);
		}
	}
}

// The kernel
__global__ void find_nonce(size_t* result, BYTE* hash, bool* found, size_t stride) {
	CUDA_SHA1_CTX ctx;
	BYTE checksum[SHA_SIZE];

	unsigned int thread = blockIdx.x * blockDim.x + threadIdx.x;
	size_t nonce_source = thread + stride;

	// Prepare the input
	int nonce_size = 0;
	BYTE nonce[SHA_SIZE];
	BYTE input[BUFFER_SIZE + SHA_SIZE];

	d_itob(nonce_source, nonce, &nonce_size);
	memcpy(input, (BYTE*)BUFFER, BUFFER_SIZE);
	memcpy(input + BUFFER_SIZE, nonce, nonce_size);

	memset(checksum, 0x0, SHA_SIZE);

	cuda_sha1_init(&ctx);
	cuda_sha1_update(&ctx, input, BUFFER_SIZE + nonce_size);
	cuda_sha1_final(&ctx, checksum);

	bool suffix_matches = true;
	for (int i = 0; i < ZEROS_TO_FIND; i++) {
		if (checksum[SHA_SIZE - i - 1] != 0) {
			suffix_matches = false;
			break;
		}
	}

	if (suffix_matches) {
		*found = true;
		*result = nonce_source;
		d_strcpy(hash, checksum);
	}
}

void get_gpu_props(int* prop)
{
	cudaDeviceProp deviceProp;

	prop[0] = 0;
	prop[1] = 0;

	if (cudaSuccess != cudaGetDeviceProperties(&deviceProp, 0))
	{
		prop[0] = 32;
		prop[1] = 32;
		return;
	}
	cudaOccupancyMaxActiveBlocksPerMultiprocessor(&prop[0], find_nonce, deviceProp.warpSize, 0);
	prop[1] = deviceProp.warpSize;
}

int main(int argc, char** argv) {
	bool h_found = false;
	size_t h_nonce = 0;
	size_t nonce_size = sizeof(size_t);
	int gpu_props[2];

	size_t i = 0;
	size_t stride = 0;
	size_t th_count = 0;

	struct timeb start, end;
	double seconds = 0;

	cudaError_t status = cudaSuccess;

	get_gpu_props(gpu_props);

	// Initialize the input data
	BYTE* h_digest = (BYTE*)malloc(SHA_SIZE);
	memset(h_digest, 0, SHA_SIZE);

	// Initialize the device variables
	size_t* d_nonce;
	bool* d_found;
	BYTE* d_digest;
	status = cudaMalloc((void**)&d_nonce, nonce_size);
	if (cudaSuccess != status) {
		fprintf(stderr, "cudaMalloc failed!");
		goto Error;
	}
	status = cudaMalloc((void**)&d_digest, SHA_SIZE);
	if (cudaSuccess != status) {
		fprintf(stderr, "cudaMalloc failed!");
		goto Error;
	}
	status = cudaMalloc((void**)&d_found, sizeof(bool));
	if (cudaSuccess != status) {
		fprintf(stderr, "cudaMalloc failed!");
		goto Error;
	}

	status = cudaMemcpy(d_found, &h_found, sizeof(bool), cudaMemcpyHostToDevice);
	if (cudaSuccess != status) {
		fprintf(stderr, "cudaMemcpy failed!");
		goto Error;
	}

	// Start the timer
	ftime(&start);

	th_count = gpu_props[0] * gpu_props[1];
	do {
		find_nonce << <gpu_props[0], gpu_props[1] >> > (d_nonce, d_digest, d_found, stride);
		status = cudaGetLastError();
		if (cudaSuccess != status) {
			fprintf(stderr, "Failed to launch the kernel!");
			goto Error;
		}

		status = cudaDeviceSynchronize();
		if (cudaSuccess != status) {
			fprintf(stderr, "cudaDeviceSynchronize failed!");
			goto Error;
		}

		status = cudaMemcpy(&h_found, d_found, sizeof(bool), cudaMemcpyDeviceToHost);
		if (cudaSuccess != status) {
			fprintf(stderr, "Failed to copy the found bool back to host");
			goto Error;
		}

		stride += th_count;
		i++;
	} while (!h_found && i <= MAX_ITERATIONS);


	// Copy the data back to the host
	status = cudaMemcpy(h_digest, d_digest, SHA_SIZE, cudaMemcpyDeviceToHost);
	if (cudaSuccess != status) {
		fprintf(stderr, "Failed to copy the resulting hash back to host");
		goto Error;
	}
	status = cudaMemcpy(&h_nonce, d_nonce, nonce_size, cudaMemcpyDeviceToHost);
	if (cudaSuccess != status) {
		fprintf(stderr, "Failed to copy the found nonce back to host");
		goto Error;
	}

	// Stop the timer
	ftime(&end);
	seconds = end.time - start.time + ((double)end.millitm - (double)start.millitm) / 1000.0;

	printf("Hashrate: %s hashes/s. Duration: %.2f seconds\n", fmt_num((size_t)(stride / seconds)).c_str(), seconds);

	if (true == h_found) {
		char hex_result[SHA_SIZE * 2 + 1]{};
		for (int offset = 0; offset < SHA_SIZE; offset++) {
			sprintf((hex_result + (2 * offset)), "%02x", h_digest[offset] & 0xff);
		}
		printf("Nonce: %lld. Digest: %s\n", h_nonce, hex_result);
	}
	else {
		printf("Could not find nonce such that the digest ends in %d zeros\n", ZEROS_TO_FIND);
	}

Error:
	free(h_digest);
	cudaFree(d_nonce);
	cudaFree(d_digest);

	return status;
}