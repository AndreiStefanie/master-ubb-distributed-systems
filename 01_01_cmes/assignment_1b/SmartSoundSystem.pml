/*
	1b - Smart Sound System

	LTL formulas:
	[](musicPlaying -> []motionSensorOn)
	[](!musicPlaying -> []!motionSensorOn)
	
	[]((hour == 0) -> <>!musicPlaying)
	[]((hour == 8) -> <>musicPlaying)
	[]((hour == 16) -> <>musicPlaying)
	[]((hour == 22) -> <>!musicPlaying)

	[](thereIsMovement -> <>(volumeAdjustment == 0))
	[](!thereIsMovement -> <>(volumeAdjustment == 20))
	
*/

mtype = {startDetection, noMovement, isMovement, isDay, isNight}
chan signal = [0] of {mtype};

bool musicPlaying = false;
bool thereIsMovement = false;
bool motionSensorOn = false;
byte volumeBuffer;
byte hour = 7;
byte volumeAdjustment = 0;

active proctype SoundSystem() {

	turnOn: atomic {
		printf("Starting motion detection");

		signal!startDetection;

		goto checkingMotionAndHour;
	}
	
  checkingMotionAndHour: {
    if 
      :: signal?isMovement -> atomic {
        printf("There is someone in the room");
        volumeAdjustment = 0;
      }
      :: signal?noMovement -> atomic {
        printf("No one in the room");
        volumeAdjustment = 20;
      }
      :: signal?isDay -> atomic {
        printf("It's a beatiful day!");
        musicPlaying = true;
				signal!startDetection
      }
      :: signal?isNight -> atomic {
        printf("Time to get some rest");
        musicPlaying = false;
				motionSensorOn = false;
				goto stopSoundSystem;
      }
    fi;

		goto checkingMotionAndHour;
	}

	stopSoundSystem: {
		printf("Stopping the sound system");
  }
}

active proctype MotionSensor() {
	startMotionSensor: atomic {
		if
    :: signal?startDetection -> atomic {
        printf("Starting motion detection");
        volumeBuffer = 0;
				motionSensorOn = true;
        goto detectingMovement;
      }
		fi;
	}
	
  detectingMovement: atomic {
		printf("Looking for motion");
		volumeBuffer++;
		
		thereIsMovement -> atomic {
				volumeBuffer >= 5 -> {
					volumeBuffer = 0;
					signal!isMovement;
				}
			}
		!thereIsMovement -> atomic {
				volumeBuffer >= 5 -> {
					volumeBuffer = 0;
					signal!noMovement;
				}
			}

		goto detectingMovement;
	}
}

active proctype Watch() {
	timePasses: atomic {
		printf("Time flies");

		hour++;
		hour == 24 -> {
				hour = 0;
			}

		hour == 8 -> {
				signal!isDay;
			}
		hour == 22 -> {
				signal!isNight;
			}
		hour == 12 -> {
				printf("Owner leaves the room");
				thereIsMovement = false
			}
		hour == 14 -> {
				printf("Owner comes back");
				thereIsMovement = true
			}
		
		goto timePasses;
	}
}
