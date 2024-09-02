const express = require('express');

const createListing = require('./createListing');

const router = express.Router();

router.post('/create-listing', createListing);

module.exports = router;