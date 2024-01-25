const express = require('express');
const router = express.Router();

const noticeController = require('../controllers/noticeController.js');

router.get('/all', noticeController.getAllNotice);
router.get('/:notice_id', noticeController.getNoticeById);


module.exports = router;