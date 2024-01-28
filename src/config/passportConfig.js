const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const KakaoStrategy = require('passport-kakao').Strategy;

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
            const userData = await accountModel.getUserByEmail(email);
            if (userData === null) {
                return done(null, false, { message: '가입 정보가 없습니다.' }); //done(error, user, info)
            }
            const result = await bcrypt.compare(password, userData.password);
            if (result) {
                return done(null, userData); // 로그인 성공
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
            const userData = await accountModel.getUserById(jwtPayload.user_id); //반드시 검사해야함
            userData[0].device_id = jwtPayload.device_id;
            // console.log('userData:', userData)
            if (userData === null) {
                return done(null, false, { message: '권한 없음' });
            } else {
                return done(null, userData[0]);
            }
        } catch (error) {
            console.log(error);
            return done(error);
        }
    }
));

// 구글 로그인을 위한 google strategy
/*
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/account/login/google/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const userName = profile.displayName;
            const userEmail = profile.emails[0].value;
            const userPicture = profile.photos[0].value;
            const userData = await accountModel.getUserByEmail(userEmail);

            if (userData === null) { // 구글로 회원가입 하는 경우 (처음 로그인) 내 이름, 이메일 주소
                const registerData = {
                    email: userEmail,
                    userName: userName,
                    password: null,
                    isAgree: 1,
                    strategy: 'google',
                    userPicture: userPicture
                };
                const userData = await accountModel.register(registerData);
                return done(null, userData); // callback url(login)에 넘겨서 바로 로그인 시키기
            }
            else {
                if (userData.strategy != 'google') { // 다른 방식으로 회원가입 되어 있음. 근데 구글로 로그인 시도함.
                    return done(null, false, { message: '다른 방식으로 가입된 이메일입니다.' });
                }
                else {  // 구글로 회원가입 되어 있음. 구글로 로그인 시도함.
                    return done(null, userData);
                }
            }
        } catch (error) {
            console.log(error);
            return done(error);
        }
    }
));

passport.use(new KakaoStrategy(
    {
        clientID: process.env.KAKAO_REST_API_KEY,
        callbackURL: '/account/login/kakao/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const userName = profile._json.properties.nickname; //username은 실제 이름이고 displayName은 카카오에서 설정한 이름
            const userEmail = profile._json.kakao_account.email; 
            const userPicture = profile._json.properties.profile_image;
            const userData = await accountModel.getUserByEmail(userEmail);

            if (userData === null) { // 카카오로 회원가입 하는 경우 (처음 로그인) 내 이름, 이메일 주소
                const registerData = {
                    email: userEmail,
                    userName: userName,
                    password: null,
                    isAgree: 1,
                    strategy: 'kakao',
                    userPicture: userPicture
                };
                const userData = await accountModel.register(registerData);
                return done(null, userData); // callback url(login)에 넘겨서 바로 로그인 시키기
            }
            else {
                if (userData.strategy != 'kakao') { // 다른 방식으로 회원가입 되어 있음. 근데 카카오로 로그인 시도함.
                    return done(null, false, { message: '다른 방식으로 가입된 이메일입니다.' });
                }
                else {  // 카카오로 회원가입 되어 있음. 카카오로 로그인 시도함.
                    return done(null, userData);
                }
            }
        } catch (error) {
            console.log(error);
            return done(error);
        }
    }
))
*/

module.exports = passport;