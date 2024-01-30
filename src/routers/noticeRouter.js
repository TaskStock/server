const express = require('express');
const router = express.Router();

const noticeController = require('../controllers/noticeController.js');

router.get('/all', noticeController.getAllNotice);
router.get('/:notice_id', noticeController.getNoticeById);
router.patch('/setting', noticeController.changeNoticeSetting);
router.post('/fcm/token', noticeController.saveFCMToken)

module.exports = router;