const express = require('express');

const createListing = require('./createListing');
const uploadLiscense = require('./uploadLiscense');

const router = express.Router();

router.post('/create-listing', createListing);
router.post('/upload-liscense', uploadLiscense);

module.exports = router;