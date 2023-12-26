const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
require("dotenv").config();


//db랑 소통하기 위한 accountModel
const accountModel = require('../models/accountModel.js');

//이메일 로그인을 위한 local strategy
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

//권한 확인을 위한 jwt strategy
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.ACCESS_TOKEN_SECRET
},
    async (jwtPayload, done) => {
        try {
            console.log(jwtPayload)
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