const express = require('express');
const router = express.Router();

const alarmController = require('../controllers/alarmController.js');

router.post('/new', alarmController.createAlarm);   // 스케쥴러에서 사용, 클라이언트 측에서 사용할 일 없으므로 프로젝트 완성 시 삭제할것
router.get('/readAllAlarms', alarmController.readAllAlarms);
router.get('/readAlarm', alarmController.readAlarm);

module.exports = router;