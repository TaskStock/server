const express = require('express');
const passport = require('../config/passportConfig.js');

const router = express.Router();

const accountController = require('../controllers/accountController.js');

router.post('/sendMail', accountController.sendMail);
router.post('/checkCode', accountController.checkCode);
router.post('/register', accountController.register);
router.post('/refresh', accountController.refresh); 

// 아래는 전부 인증/인가가 필요한 라우터
router.post('/login/email', passport.authenticate('local', { session: false }), accountController.login);
router.delete('/logout', passport.authenticate('jwt', { session: false }), accountController.logout);
// router.post('/createSetting', accountController.createSetting);
router.get('/getUserInfo', passport.authenticate('jwt', { session: false }), accountController.getUserInfo);

//구글 로그인 관련
router.get('/login/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/login/google/callback', passport.authenticate('google', { session: false }), accountController.login);

//카카오 로그인 관련
router.get('/login/kakao', passport.authenticate('kakao'));
router.get('/login/kakao/callback', passport.authenticate('kakao', { session: false }), accountController.login);

router.get('')

module.exports = router;