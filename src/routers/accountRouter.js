const express = require('express');
const router = express.Router();

const accountController = require('../controllers/accountController.js');

router.post('/new', accountController.newMember);

module.exports = router;