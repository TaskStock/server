const express = require('express');
const router = express.Router();

const snsController = require('../controllers/snsController.js');

router.patch('/private', snsController.changePrivate);

module.exports = router;

