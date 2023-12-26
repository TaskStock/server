const express = require('express');
const passport = require('../config/passportConfig.js');

const router = express.Router();

const accountController = require('../controllers/accountController.js');

router.post('/sendMail', accountController.sendMail);
router.post('/checkCode', accountController.checkCode);
router.post('/register', accountController.register);
router.post('/loginEmail', passport.authenticate('local', { session: false }), accountController.loginEmail);
router.post('/logout', accountController.logout);

module.exports = router;