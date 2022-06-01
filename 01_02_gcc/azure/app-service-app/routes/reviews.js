const express = require('express');
const multer = require('multer');
const { getReviews, addReview } = require('../services/review');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', async (_, res) => {
  const reviews = await getReviews();

  return res.json(reviews);
});

router.post('/', upload.single('image'), async (req, res) => {
  const data = JSON.parse(req.body.review);

  const result = await addReview(data.author, data.comment, req.file);

  return res.status(201).json(result);
});

module.exports = router;
