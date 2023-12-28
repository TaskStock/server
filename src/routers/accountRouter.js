const express = require('express');
const passport = require('../config/passportConfig.js');

const router = express.Router();

const accountController = require('../controllers/accountController.js');

router.post('/sendMail', accountController.sendMail);
router.post('/checkCode', accountController.checkCode);
router.post('/register', accountController.register);
router.post('/login/email', passport.authenticate('local', { session: false }), accountController.login);
router.delete('/logout', passport.authenticate('jwt', { session: false }), accountController.logout);
router.post('/refresh', accountController.refresh);
router.post('/createSetting', accountController.createSetting);
//구글 로그인 관련
router.get('/login/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/login/google/callback', passport.authenticate('google', { session: false }), accountController.login);

module.exports = router;