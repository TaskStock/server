const express = require('express');
const router = express.Router();

const noticeController = require('../controllers/noticeController.js');

router.get('/all', noticeController.getAllNotice);
router.get('/:notice_id', noticeController.getNoticeById);
router.patch('/setting/push', noticeController.changeNoticeSetting);
router.post('/fcm/token', noticeController.saveFCMToken)
router.post('/setting/suggestion', noticeController.sendCustomerSuggestion);

module.exports = router;