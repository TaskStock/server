const express = require('express');
const router = express.Router();

const siuserController = require('../controllers/siuserController.js');

router.get('/myinterest', siuserController.getItemsMyinterest);

module.exports = router;