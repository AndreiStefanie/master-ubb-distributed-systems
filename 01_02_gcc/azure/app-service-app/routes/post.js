const express = require('express');
const multer = require('multer');

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() }).single('image');
