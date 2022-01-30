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

mtype = {startDetection, noMovement, isMovement, isDay, isNight, ownerEntersRoom, ownerLeavesRoom}
chan signal = [0] of {mtype};

bool musicPlaying = false;
bool thereIsMovement = false;
bool motionSensorOn = false;
byte hour = 7;

byte volumeAdjustment = 0;
byte volumeBuffer;
bool incrementBuffer = false;

active proctype SoundSystem() {
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

		if
		:: incrementBuffer -> {
			volumeBuffer++;
			volumeBuffer >= 5 -> {
				volumeBuffer = 0;
				incrementBuffer = false;
				thereIsMovement -> {
					signal!isMovement;
				}
				!thereIsMovement -> {
					signal!noMovement;
				}
			}
		}
		fi;
		
		if
		:: signal?ownerLeavesRoom -> atomic {
			incrementBuffer = true;
			thereIsMovement = true;
		}
		:: signal?ownerEntersRoom -> atomic {
			incrementBuffer = true;
			thereIsMovement = false;
		}
		fi;

		goto detectingMovement;
	}
}

active proctype Watch() {
	timePasses: atomic {
		printf("Time flies");

		hour++;
		if
		:: hour == 24 -> {
			hour = 0;
		}
		:: hour == 8 -> {
			signal!isDay;
		}
		:: hour == 22 -> {
			signal!isNight;
		}
		:: hour == 12 -> {
			printf("Owner leaves the room");
			signal!ownerLeavesRoom;
		}
		:: hour == 14 -> {
			printf("Owner comes back");
			signal!ownerEntersRoom;
		}
		fi;
		
		goto timePasses;
	}
}
