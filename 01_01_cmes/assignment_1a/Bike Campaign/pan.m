#define rand	pan_rand
#if defined(HAS_CODE) && defined(VERBOSE)
	cpu_printf("Pr: %d Tr: %d\n", II, t->forw);
#endif
	switch (t->forw) {
	default: Uerror("bad forward move");
	case 0:	/* if without executable clauses */
		continue;
	case 1: /* generic 'goto' or 'skip' */
		IfNotBlocked
		_m = 3; goto P999;
	case 2: /* generic 'else' */
		IfNotBlocked
		if (trpt->o_pm&1) continue;
		_m = 3; goto P999;

		 /* CLAIM never_0 */
	case 3: /* STATE 1 - C:\Users\Andrei\Projects\Master\01_01_CMES\jspin\used-bikes\bike_campaign.ltl:4 - [((!(bike_donated)&&!(campaign_started)))] (0:0:0 - 1) */
		
#if defined(VERI) && !defined(NP)
#if NCLAIMS>1
		{	static int reported1 = 0; int nn = (int) ((Pclaim *)this)->_n;
			if (verbose && !reported1)
			{	printf("depth %ld: Claim %s (%d), state %d (line %d)\n",
					depth, procname[spin_c_typ[nn]], nn, (int) ((Pclaim *)this)->_p, src_claim[ (int) ((Pclaim *)this)->_p ]);
				reported1 = 1;
				fflush(stdout);
		}	}
#else
{	static int reported1 = 0;
			if (verbose && !reported1)
			{	printf("depth %d: Claim, state %d (line %d)\n",
					(int) depth, (int) ((Pclaim *)this)->_p, src_claim[ (int) ((Pclaim *)this)->_p ]);
				reported1 = 1;
				fflush(stdout);
		}	}
#endif
#endif
		reached[2][1] = 1;
		if (!(( !(((int)now.bike_donated))&& !(((int)now.campaign_started)))))
			continue;
		_m = 3; goto P999; /* 0 */
	case 4: /* STATE 7 - C:\Users\Andrei\Projects\Master\01_01_CMES\jspin\used-bikes\bike_campaign.ltl:9 - [(!(campaign_started))] (0:0:0 - 1) */
		
#if defined(VERI) && !defined(NP)
#if NCLAIMS>1
		{	static int reported7 = 0; int nn = (int) ((Pclaim *)this)->_n;
			if (verbose && !reported7)
			{	printf("depth %ld: Claim %s (%d), state %d (line %d)\n",
					depth, procname[spin_c_typ[nn]], nn, (int) ((Pclaim *)this)->_p, src_claim[ (int) ((Pclaim *)this)->_p ]);
				reported7 = 1;
				fflush(stdout);
		}	}
#else
{	static int reported7 = 0;
			if (verbose && !reported7)
			{	printf("depth %d: Claim, state %d (line %d)\n",
					(int) depth, (int) ((Pclaim *)this)->_p, src_claim[ (int) ((Pclaim *)this)->_p ]);
				reported7 = 1;
				fflush(stdout);
		}	}
#endif
#endif
		reached[2][7] = 1;
		if (!( !(((int)now.campaign_started))))
			continue;
		_m = 3; goto P999; /* 0 */
	case 5: /* STATE 11 - C:\Users\Andrei\Projects\Master\01_01_CMES\jspin\used-bikes\bike_campaign.ltl:11 - [-end-] (0:0:0 - 1) */
		
#if defined(VERI) && !defined(NP)
#if NCLAIMS>1
		{	static int reported11 = 0; int nn = (int) ((Pclaim *)this)->_n;
			if (verbose && !reported11)
			{	printf("depth %ld: Claim %s (%d), state %d (line %d)\n",
					depth, procname[spin_c_typ[nn]], nn, (int) ((Pclaim *)this)->_p, src_claim[ (int) ((Pclaim *)this)->_p ]);
				reported11 = 1;
				fflush(stdout);
		}	}
#else
{	static int reported11 = 0;
			if (verbose && !reported11)
			{	printf("depth %d: Claim, state %d (line %d)\n",
					(int) depth, (int) ((Pclaim *)this)->_p, src_claim[ (int) ((Pclaim *)this)->_p ]);
				reported11 = 1;
				fflush(stdout);
		}	}
#endif
#endif
		reached[2][11] = 1;
		if (!delproc(1, II)) continue;
		_m = 3; goto P999; /* 0 */

		 /* PROC Student */
	case 6: /* STATE 1 - bike_campaign.pml:31 - [signal?collectionOfUsedBicycles] (0:0:0 - 1) */
		reached[1][1] = 1;
		if (boq != now.signal) continue;
		if (q_len(now.signal) == 0) continue;

		XX=1;
		if (1 != qrecv(now.signal, 0, 0, 0)) continue;
		if (q_flds[((Q0 *)qptr(now.signal-1))->_t] != 1)
			Uerror("wrong nr of msg fields in rcv");
		;
		qrecv(now.signal, XX-1, 0, 1);
		
#ifdef HAS_CODE
		if (readtrail && gui) {
			char simtmp[32];
			sprintf(simvals, "%d?", now.signal);
		sprintf(simtmp, "%d", 1); strcat(simvals, simtmp);		}
#endif
		if (q_zero(now.signal))
		{	boq = -1;
#ifndef NOFAIR
			if (fairness
			&& !(trpt->o_pm&32)
			&& (now._a_t&2)
			&&  now._cnt[now._a_t&1] == II+2)
			{	now._cnt[now._a_t&1] -= 1;
#ifdef VERI
				if (II == 1)
					now._cnt[now._a_t&1] = 1;
#endif
#ifdef DEBUG
			printf("%3d: proc %d fairness ", depth, II);
			printf("Rule 2: --cnt to %d (%d)\n",
				now._cnt[now._a_t&1], now._a_t);
#endif
				trpt->o_pm |= (32|64);
			}
#endif

		};
		_m = 4; goto P999; /* 0 */
	case 7: /* STATE 2 - bike_campaign.pml:32 - [printf('Student is aware of the used bikes collection campaign\\n')] (0:0:0 - 1) */
		IfNotBlocked
		reached[1][2] = 1;
		Printf("Student is aware of the used bikes collection campaign\n");
		_m = 3; goto P999; /* 0 */
	case 8: /* STATE 8 - bike_campaign.pml:40 - [printf('Student has and wants to donate his/her used bike\\n')] (0:14:1 - 1) */
		IfNotBlocked
		reached[1][8] = 1;
		Printf("Student has and wants to donate his/her used bike\n");
		/* merge: printf('Student brings the used bike to UBBUsedBikes\\n')(14, 9, 14) */
		reached[1][9] = 1;
		Printf("Student brings the used bike to UBBUsedBikes\n");
		/* merge: bike_donated = 1(14, 10, 14) */
		reached[1][10] = 1;
		(trpt+1)->bup.oval = ((int)now.bike_donated);
		now.bike_donated = 1;
#ifdef VAR_RANGES
		logval("bike_donated", ((int)now.bike_donated));
#endif
		;
		_m = 3; goto P999; /* 2 */
	case 9: /* STATE 12 - bike_campaign.pml:46 - [printf('Student does not want to donate a bike\\n')] (0:15:1 - 1) */
		IfNotBlocked
		reached[1][12] = 1;
		Printf("Student does not want to donate a bike\n");
		/* merge: bike_donated = 0(15, 13, 15) */
		reached[1][13] = 1;
		(trpt+1)->bup.oval = ((int)now.bike_donated);
		now.bike_donated = 0;
#ifdef VAR_RANGES
		logval("bike_donated", ((int)now.bike_donated));
#endif
		;
		_m = 3; goto P999; /* 1 */
	case 10: /* STATE 15 - bike_campaign.pml:49 - [-end-] (0:0:0 - 1) */
		IfNotBlocked
		reached[1][15] = 1;
		if (!delproc(1, II)) continue;
		_m = 3; goto P999; /* 0 */

		 /* PROC UBBUsedBikes */
	case 11: /* STATE 1 - bike_campaign.pml:17 - [campaign_started = 1] (0:0:1 - 1) */
		IfNotBlocked
		reached[0][1] = 1;
		(trpt+1)->bup.oval = ((int)now.campaign_started);
		now.campaign_started = 1;
#ifdef VAR_RANGES
		logval("campaign_started", ((int)now.campaign_started));
#endif
		;
		_m = 3; goto P999; /* 0 */
	case 12: /* STATE 2 - bike_campaign.pml:18 - [signal!collectionOfUsedBicycles] (0:0:0 - 1) */
		IfNotBlocked
		reached[0][2] = 1;
		if (q_len(now.signal))
			continue;
#ifdef HAS_CODE
		if (readtrail && gui) {
			char simtmp[32];
			sprintf(simvals, "%d!", now.signal);
		sprintf(simtmp, "%d", 1); strcat(simvals, simtmp);		}
#endif
		
		qsend(now.signal, 0, 1, 1);
		{ boq = now.signal; };
		_m = 2; goto P999; /* 0 */
	case 13: /* STATE 3 - bike_campaign.pml:20 - [printf('UBBUsedBikes notifies the students that the campaign for collecting used bikes is started\\n')] (0:7:0 - 1) */
		IfNotBlocked
		reached[0][3] = 1;
		Printf("UBBUsedBikes notifies the students that the campaign for collecting used bikes is started\n");
		/* merge: goto receivingOldBikes(7, 4, 7) */
		reached[0][4] = 1;
		;
		_m = 3; goto P999; /* 1 */
	case 14: /* STATE 6 - bike_campaign.pml:26 - [printf('UBBUsedBikes is waiting for students to bring used bikes \\n')] (0:0:0 - 1) */
		IfNotBlocked
		reached[0][6] = 1;
		Printf("UBBUsedBikes is waiting for students to bring used bikes \n");
		_m = 3; goto P999; /* 0 */
	case 15: /* STATE 8 - bike_campaign.pml:28 - [-end-] (0:0:0 - 1) */
		IfNotBlocked
		reached[0][8] = 1;
		if (!delproc(1, II)) continue;
		_m = 3; goto P999; /* 0 */
	case  _T5:	/* np_ */
		if (!((!(trpt->o_pm&4) && !(trpt->tau&128))))
			continue;
		/* else fall through */
	case  _T2:	/* true */
		_m = 3; goto P999;
#undef rand
	}

