const express = require('express');
const router = express.Router();

const siuserController = require('../controllers/siuserController.js');

router.get('/myinterest', siuserController.getItemsMyinterest);
router.get('/todaypopular', siuserController.getItemsTodaypopular);
router.get('/todayrecommend', siuserController.getItemsTodayrecommend);

module.exports = router;