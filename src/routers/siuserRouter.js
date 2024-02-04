const express = require('express');
const router = express.Router();

const siuserController = require('../controllers/siuserController.js');

router.get('/myinterest', siuserController.getItemsMyinterest);
router.get('/todaypopular', siuserController.getItemsTodaypopular);
router.get('/todayrecommend', siuserController.getItemsTodayrecommend);
router.get('/all', siuserController.getItemsAll);
router.get('/detail/:stockitem_id', siuserController.getItem);

module.exports = router;