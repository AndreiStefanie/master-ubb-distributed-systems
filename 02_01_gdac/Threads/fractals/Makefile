all: mandelbrot

run: mandelbrot
	./mandelbrot

mandelbrot: *.c *.h
	gcc -Wall -o mandelbrot *.c ../lib/*.c -lm -lrt -pthread

clean:
	-rm mandelbrot mandelbrot.zip *.png

pack:
	-rm mandelbrot.zip
	zip mandelbrot.zip ./*.h ./*.c Makefile

.PHONY: all clean run pack
