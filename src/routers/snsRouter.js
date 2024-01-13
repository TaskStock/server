const express = require('express');
const router = express.Router();

const snsController = require('../controllers/snsController.js');

router.patch('/private', snsController.changePrivate);
router.get('/users', snsController.showRanking);

module.exports = router;

