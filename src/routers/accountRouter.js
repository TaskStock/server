const express = require('express');
const passport = require('../config/passportConfig.js');

const router = express.Router();

const accountController = require('../controllers/accountController.js');

router.post('/sendMail', accountController.sendMail);
router.post('/checkCode', accountController.checkCode);
router.post('/register', accountController.register);
router.post('/login/email', passport.authenticate('local', { session: false }), accountController.loginEmail);
router.delete('/logout', passport.authenticate('jwt', { session: false }), accountController.logout);
router.post('/refresh', accountController.refresh);

module.exports = router;