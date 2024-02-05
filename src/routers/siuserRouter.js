const express = require('express');
const router = express.Router();

const siuserController = require('../controllers/siuserController.js');

router.get('/market', siuserController.getMarketInfo);
router.get('/all', siuserController.getItemsAll);
router.get('/detail/:stockitem_id', siuserController.getItem);

module.exports = router;