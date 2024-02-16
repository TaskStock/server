const express = require('express');
const router = express.Router();

const sivalueController = require('../controllers/sivalueController.js');

router.get('/month/:stockitem_id', sivalueController.getSIValueOnemonth);

module.exports = router;