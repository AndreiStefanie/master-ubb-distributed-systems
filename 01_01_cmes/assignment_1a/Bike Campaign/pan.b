	switch (t->back) {
	default: Uerror("bad return move");
	case  0: goto R999; /* nothing to undo */

		 /* CLAIM never_0 */
;
		;
		;
		;
		
	case 5: /* STATE 11 */
		;
		p_restor(II);
		;
		;
		goto R999;

		 /* PROC Student */

	case 6: /* STATE 1 */
		;
		XX = 1;
		unrecv(now.signal, XX-1, 0, 1, 1);
		;
		;
		goto R999;
;
		;
		
	case 8: /* STATE 10 */
		;
		now.bike_donated = trpt->bup.oval;
		;
		goto R999;

	case 9: /* STATE 13 */
		;
		now.bike_donated = trpt->bup.oval;
		;
		goto R999;

	case 10: /* STATE 15 */
		;
		p_restor(II);
		;
		;
		goto R999;

		 /* PROC UBBUsedBikes */

	case 11: /* STATE 1 */
		;
		now.campaign_started = trpt->bup.oval;
		;
		goto R999;

	case 12: /* STATE 2 */
		;
		_m = unsend(now.signal);
		;
		goto R999;
;
		
	case 13: /* STATE 3 */
		goto R999;
;
		;
		
	case 15: /* STATE 8 */
		;
		p_restor(II);
		;
		;
		goto R999;
	}

