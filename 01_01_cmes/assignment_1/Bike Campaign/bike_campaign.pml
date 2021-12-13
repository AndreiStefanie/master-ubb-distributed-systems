/**
  Actors: UBB Used Bikes Center (UBBUsedBikes), Student (S)

  Signals:
    - UBBUsedBikes -> S: used bikes collection campaign started
    - S -> UBBUsedBikes: donates used bike
 */

mtype = {collectionOfUsedBicycles};
chan signal = [0] of {mtype};

bool campaign_started = false;
bool bike_donated = false;

active proctype UBBUsedBikes() {
	waiting: atomic {
		campaign_started = true;
		signal!collectionOfUsedBicycles;

		printf("UBBUsedBikes notifies the students that the campaign for collecting used bikes is started\n");

		goto receivingOldBikes;
	}

	receivingOldBikes: atomic {
		printf("UBBUsedBikes is waiting for students to bring used bikes \n");
	}
}

active proctype Student() {
	waiting:signal?collectionOfUsedBicycles->atomic{
		printf("Student is aware of the used bikes collection campaign\n");
		if
		::goto donateUsedBike
		::goto noBikeToDonate
		fi;
	}

	donateUsedBike: atomic { 
		printf("Student has and wants to donate his/her used bike\n");	
		printf("Student brings the used bike to UBBUsedBikes\n");
		bike_donated=true;
	}

	noBikeToDonate: atomic{
		printf("Student does not want to donate a bike\n");	
		bike_donated=false;
	}
}

/* LTL formulas:
	1. [](campaign_started -> <>bike_donated)
	2. [](!bike_donated U campaign_started)
	3. [](!bike_donated -> <>campaign_started)
*/
