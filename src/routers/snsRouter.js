const express = require('express');
const router = express.Router();

const snsController = require('../controllers/snsController.js');

router.post('/sns/private', snsController.changePrivate);

