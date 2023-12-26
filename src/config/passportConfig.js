const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;  

//db랑 소통하기 위한 accountModel
const accountModel = require('../models/accountModel.js');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},
    async (email, password, done) => {
        try {
            const userData = await accountModel.getUser(email);
            if (userData === null) {
                return done(null, false, { message: '존재하지 않는 이메일입니다.' }); //done(error, user, info)
            }
            const result = await bcrypt.compare(password, userData.password);
            if (result) {
                return done(null, userData);
            } else {
                return done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
            }
        } catch (error) {
            console.log(error);
            return done(error);
        }
    }
));

passport.use(new JWTStrategy({ // ?세부 로직 로그인 구현 후 수정 필요
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
},
    async (jwtPayload, done) => {
        try {
            const userData = await accountModel.getUser(jwtPayload.email);
            if (userData === null) {
                return done(null, false, { message: '존재하지 않는 이메일입니다.' });
            } else {
                return done(null, userData);
            }
        } catch (error) {
            console.log(error);
            return done(error);
        }
    }
));

module.exports = passport;