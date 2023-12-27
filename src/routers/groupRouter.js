const express = require('express');
const router = express.Router();

const groupController = require('../controllers/groupController.js');

router.post('/create', groupController.createGroup);
router.post('/join', groupController.joinGroup);
router.get('/rank', groupController.getRank);

module.exports = router;