const express = require('express');

const createListing = require('./createListing');
const uploadLiscense = require('./uploadLiscense');
const startOrEndReservation = require('./startOrEndReservation');
const uploadInsurance = require('./uploadInsurance');
const uploadFedexId = require('./uploadFedexId');

const router = express.Router();

router.post('/create-listing', createListing);
router.post('/upload-liscense', uploadLiscense);
router.post('/upload-insurance', uploadInsurance);
router.post('/upload-fedexid', uploadFedexId);
router.post('/startOrEndReservation', startOrEndReservation);

module.exports = router;