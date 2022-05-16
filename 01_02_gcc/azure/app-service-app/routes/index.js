const express = require('express');
const { getReviews } = require('../services/review');

const router = express.Router();

router.get('/', async (_, res) => {
  const reviews = await getReviews();
  console.log(JSON.stringify(reviews));

  res.render('index', { title: 'Guestbook', reviews });
});

module.exports = router;
