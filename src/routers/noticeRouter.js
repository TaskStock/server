const express = require('express');
const router = express.Router();

const noticeController = require('../controllers/noticeController.js');

router.get('/all', noticeController.getAllNotice);

module.exports = router;