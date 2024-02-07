const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

require("dotenv").config();


//db랑 소통하기 위한 accountModel
const accountModel = require('../models/accountModel.js');
const db = require('../config/db.js');

//이메일 로그인을 위한 local strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},
    async (email, password, done) => {
        try {
            const userData = await accountModel.getUserByEmail(db, email);
            if (userData === null) {
                return done(null, false, { message: '가입 정보가 없습니다.' }); //done(error, user, info)
            } else if (userData.strategy != 'local') {
                return done(null, false, { message: '다른 방식으로 가입된 이메일입니다.' }); //소셜 로그인으로 가입된 이메일일 경우
            }
            const result = await bcrypt.compare(password, userData.password);
            if (result) {
                return done(null, userData); // 로그인 성공
            } else {
                return done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
            }
        } catch (error) {
            return done(error);
        } 
    }
));

//권한 확인을 위한 jwt strategy
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.ACCESS_TOKEN_SECRET
},
    async (jwtPayload, done) => {
        try {
            const userData = {
                user_id: jwtPayload.user_id,
                device_id: jwtPayload.device_id,
                region: jwtPayload.region
            }
            return done(null, userData);

        } catch (error) {
            return done(error);
        }
    }
));


module.exports = passport;