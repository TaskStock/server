const express = require('express');
const passport = require('../config/passportConfig.js');

const router = express.Router();

const accountController = require('../controllers/accountController.js');

router.post('/sendMail', accountController.sendMailForRegister);
router.post('/checkCode', accountController.checkCode);
router.post('/register', accountController.register);
router.post('/refresh', accountController.refresh); 

// 아래는 전부 인증/인가가 필요한 라우터
router.post('/login/email', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) {
            // 서버 에러 처리
            return next(err);
        }
        if (!user) {
            // 인증 실패 처리
            return res.status(200).json(info);
        }
        // 인증 성공, accountController.login 호출
        req.user = user; // accountController.login에서 사용자 정보에 접근할 수 있도록 req.user에 할당
        return accountController.login(req, res, next);
    })(req, res, next);
});


router.delete('/logout', passport.authenticate('jwt', { session: false }), accountController.logout);
// router.post('/createSetting', accountController.createSetting);
router.get('/getUserInfo', passport.authenticate('jwt', { session: false }), accountController.getUserInfo);
router.delete('/unregister', passport.authenticate('jwt', { session: false }), accountController.unregister);

//소셜 로그인 관련
router.post('/login/social', accountController.loginSocial);

//계정 정보 관련
router.post('/sendMail/password', accountController.sendMailForFindPassword);
router.post('/change/password', accountController.changePassowrd);
router.post('/setting/confirm/password', passport.authenticate('jwt', { session: false }), accountController.confirmPassword);
router.delete('/setting/unregister', passport.authenticate('jwt', { session: false }), accountController.unregister);
router.patch('/setting/theme', passport.authenticate('jwt', { session: false }), accountController.changeTheme);


module.exports = router;