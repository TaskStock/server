const accountModel = require('../models/accountModel.js');
const mailer = require('../../nodemailer/mailer.js');
const jwt = require('jsonwebtoken');
const dayjs = require('dayjs');x
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

function generateAccessToken(email) {
    const expiresIn = "1h";
    const accessToken = jwt.sign({email}, process.env.ACCESS_TOKEN_SECRET, { expiresIn });
    return [accessToken, expiresIn];
}

function generateRefreshToken(email) {
    return jwt.sign({email}, process.env.REFRESH_TOKEN_SECRET);
}

module.exports = {
    //이메일 인증
    sendMail: async (req, res) => {
        try {
            const emailData = req.body;
            const availible = await accountModel.checkAvailible(emailData);

            if (!availible) {
                res.status(200).json({ 
                    result: "fail" ,
                    message: "이미 가입된 이메일입니다."
                });
            } else {
                let authCode = '';
                for (let i = 0; i < 6; i++) {
                    authCode += Math.floor(Math.random() * 10);
                } //여섯자리 숫자로 이루어진 인증코드 생성(string)
                const mailResult = await mailer(emailData.email, authCode);
                if (mailResult) {
                    const codeId = await accountModel.saveCode(authCode);
                    
                    res.status(200).json({ 
                        result: "success", 
                        codeId: codeId
                    });
                }
            } 
        } catch (error) {
            console.log(error);
            res.status(500).json({ 
                result: "error", 
                message: "서버 오류"
            });
        }
    },
    //인증코드 확인
    checkCode: async (req, res) => {
        try {
            const inputData = req.body;
            const checkResult = await accountModel.checkCode(inputData);
            
            if (checkResult) {
                
                const wellDeleted = await accountModel.deleteCode(inputData);
                if (!wellDeleted) {
                    res.status(500).json({ 
                        result: "success", 
                        message: "인증은 성공, 코드 삭제에서 오류"
                    });
                }
                res.status(200).json({ 
                    result: "success", 
                    message: "코드 DB에서 삭제" 
                });
            } else {
                res.status(200).json({ 
                    result: "fail", 
                    message: "인증코드가 일치하지 않음" 
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ 
                result: "error", 
                message: "서버 오류"
            });
        }
    },
    //이메일 회원가입
    register: async (req, res) => {
        try {
            const registerData = req.body;
            const inserted_email = await accountModel.register(registerData);

            if (req.body.email == inserted_email) {
                
                //accessToken 처리
                const [accessToken, expiresIn] = generateAccessToken(req.body.email);
                console.log(expiresIn)
                const utcNow = dayjs.utc();
                const expireTime = utcNow.add(parseInt(expiresIn), 'hour').format('YYYY-MM-DD HH:mm:ss')
                console.log(expireTime)

                // refreshToken 처리
                const refreshToken = generateRefreshToken(req.body.email);
                await accountModel.saveRefreshToken(req.body.email, refreshToken);

                console.log("회원가입 성공");
                res.status(200).json({ 
                    result: "success", 
                    message: `${inserted_email} 회원가입 성공`, 
                    accessToken: accessToken, 
                    refreshToken: refreshToken,
                    expireTime: expireTime
                });
            } else {
                console.log("회원가입 오류")
                res.status(200).json({ 
                    result: "fail", 
                    message: "회원가입 실패. 잘못된 이메일이 DB에 들어감" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ 
                result: "error", 
                message: "서버 오류"
            });
        }
    },
    //이메일 로그인
    loginEmail: async (req, res) => {
        try {
            const userData = req.user; // passport를 통해 성공적으로 로그인한 유저 객체
            const [accessToken, expiresIn] = generateAccessToken(userData.email);
            const utcNow = dayjs.utc();
            const expireTime = utcNow.add(parseInt(expiresIn), 'hour').format('YYYY-MM-DD HH:mm:ss')
            const refreshToken = generateRefreshToken(userData.email);
            await accountModel.saveRefreshToken(userData.email, refreshToken);

            console.log("로그인 성공");
            res.status(200).json({ 
                result: "success", 
                message: `${userData.email} 로그인 성공`, 
                accessToken: accessToken, 
                refreshToken: refreshToken,
                expireTime: expireTime
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ 
                result: "error", 
                message: "서버 오류"
            });
        }
    }
}