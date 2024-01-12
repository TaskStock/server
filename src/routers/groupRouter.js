const express = require('express');
const router = express.Router();

const groupController = require('../controllers/groupController.js');

router.post('', groupController.createGroup);
router.post('/join', groupController.joinGroup);
router.get('/rank', groupController.getRank);
router.post('/changeHead', groupController.changeHead);
router.delete('/delete', groupController.deleteGroup);

module.exports = router;