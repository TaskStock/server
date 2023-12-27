const express = require('express');
const router = express.Router();

const valueController = require('../controllers/valueController.js');

router.post('/new/newuser', valueController.createByNewUser);
router.post('/new/existuser', valueController.createByExistUser);

module.exports = router;