const accountModel = require('../models/accountModel.js');
const mailer = require('../../nodemailer/mailer.js');
const jwt = require('jsonwebtoken');
dayjs.extend(utc);

// 현재는 email만 payload에 포함시키는데 추후에 필요한 정보들 추가. 민감한 정보는 포함시키지 않는다.
function generateAccessToken(userData) {
    const expiresIn = "1h";
    const email = userData.email;
    const accessToken = jwt.sign({email}, process.env.ACCESS_TOKEN_SECRET, { expiresIn });

    return accessToken;
}

function generateRefreshToken(userData) {
    const email = userData.email;
    const refreshToken = jwt.sign({email}, process.env.REFRESH_TOKEN_SECRET);
    
    return refreshToken;
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
            const userData = await accountModel.register(registerData);

            if (req.body.email == userData.email) {
                
                //accessToken 처리
                const accessToken = generateAccessToken(userData);
                console.log(expireTime)

                // refreshToken 처리
                const refreshToken = generateRefreshToken(userData);
                await accountModel.saveRefreshToken(req.body.email, refreshToken);

                console.log("회원가입 성공");
                res.status(200).json({ 
                    result: "success", 
                    message: `${userData.email} 회원가입 성공`, 
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
            const accessToken = generateAccessToken(userData);
            const refreshToken = generateRefreshToken(userData);
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
    }, 
    //로그아웃
    logout: async (req, res) => {
        try {
            // 로그아웃 시 refreshToken 삭제, accessToken 및 refreshToken은 클라이언트에서 삭제
            const userEmail = req.user.email; // passport를 통해 넘어온 객체는 req.user에 저장되어 있음 (req.body가 아님)
            const deleteResult = await accountModel.deleteRefreshToken(userEmail);
            
            if (deleteResult) {
                res.status(200).json({ 
                    result: "success", 
                    message: "로그아웃 성공" 
                });
            } else {
                res.status(200).json({ 
                    result: "fail", 
                    message: "로그아웃 실패" 
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
    //accessToken 재발급
    refresh: async (req, res) => {
        try {
            const email = req.body.email;
            const refreshToken = req.body.refreshToken;

            if (refreshToken === null) {
                return res.status(401).json({ 
                    result: "fail", 
                    message: "refreshToken이 없습니다." 
                });
            }
            const found = await accountModel.checkRefreshToken(email, refreshToken);

            if (!found) {
                return res.status(403).json({
                    result: "fail",
                    message: "refreshToken이 유효하지 않습니다."
                });
            } else {
                jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, userData) => {
                    if (err) {
                        return res.status(403).json({
                            result: "fail",
                            message: "refreshToken이 유효하지 않습니다."
                        });
                    } else {
                        const accessToken = generateAccessToken(userData);
                        return res.status(200).json({
                            result: "success",
                            message: "accessToken 재발급 성공",
                            accessToken: accessToken,
                        });
                    }
                });
            }
            
        } catch (error) {
            console.log(error);
            res.status(500).json({ 
                result: "error", 
                message: "서버 오류"
            });
        }
    }
}