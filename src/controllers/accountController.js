const accountModel = require('../models/accountModel.js');
const mailer = require('../../nodemailer/mailer.js');
const jwt = require('jsonwebtoken');

// 현재는 email만 payload에 포함시키는데 추후에 필요한 정보들 추가. 민감한 정보는 포함시키지 않는다.
function generateAccessToken(userData) {
    const expiresIn = "1h";
    const user_id = userData.user_id;
    const accessToken = jwt.sign({user_id}, process.env.ACCESS_TOKEN_SECRET, { expiresIn });

    return accessToken;
}

function generateRefreshToken(userData) {
    const user_id = userData.user_id;
    const refreshToken = jwt.sign({user_id}, process.env.REFRESH_TOKEN_SECRET);
    
    return refreshToken;
}

module.exports = {
    //이메일 인증
    sendMail: async (req, res) => {
        try {
            const email = req.body.email;
            const userData = await accountModel.getUserByEmail(email); //이메일로 유저 정보 가져오기

            const availible = (userData === null) ? true : false;
            if (!availible) {
                res.status(200).json({ 
                    result: "fail" ,
                    message: "이미 가입된 이메일입니다.",
                    strategy: userData.strategy 
                });
            } else {
                let authCode = '';
                for (let i = 0; i < 6; i++) {
                    authCode += Math.floor(Math.random() * 10);
                } //여섯자리 숫자로 이루어진 인증코드 생성(string)
                const mailResult = await mailer(email, authCode);
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
                    console.log("인증 성공, 코드 삭제 실패");
                    res.status(200).json({ 
                        result: "success"
                    });
                }
                console.log("인증 성공, 코드 삭제 완료");
                res.status(200).json({ 
                    result: "success"
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
            const email = req.body.email;
            const queryResult = await accountModel.getUserByEmail(email); //이메일로 유저 정보 가져오기

            //앞에서 확인하긴 했는데 공격에 대비해서 한번 더 확인
            if (queryResult !== null) {
                return res.status(200).json({
                    result: "fail",
                    message: "이미 가입된 이메일입니다."
                })
            }

            const registerData = req.body; 
            const userData = await accountModel.register(registerData);

            //accessToken 처리
            const accessToken = generateAccessToken(userData);

            // refreshToken 처리
            const refreshToken = generateRefreshToken(userData);
            await accountModel.saveRefreshToken(userData.user_id, refreshToken); // refreshToken DB에 저장(user_id가 PK)

            console.log("회원가입 성공");
            return res.status(200).json({ 
                result: "success",
                accessToken: accessToken, 
                refreshToken: refreshToken,
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ 
                result: "error", 
                message: "서버 오류"
            });
        }
    },
    //초기 설정 저장
    createSetting: async (req, res) => {
        try {
            const settingData = req.body;
            await accountModel.createSetting(settingData);
            res.status(200).json({ 
                result: "success", 
                message: "초기 설정 저장 성공"
            }); 
            
        } catch (error) {
            console.log(error);
            res.status(500).json({ 
                result: "error", 
                message: "서버 오류"
            });
        }
    },
    //로그인
    login: async (req, res) => {
        try {
            const userData = req.user; // passport를 통해 성공적으로 로그인한 유저 객체
            const accessToken = generateAccessToken(userData);
            const refreshToken = generateRefreshToken(userData);
            await accountModel.saveRefreshToken(userData.user_id, refreshToken);

            console.log("로그인 성공");
            res.status(200).json({ 
                result: "success", 
                message: `${userData.email} 로그인 성공`, 
                user_id: userData.user_id,
                accessToken: accessToken, 
                refreshToken: refreshToken,
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
            const user_id = req.user.user_id; // passport를 통해 넘어온 객체는 req.user에 저장되어 있음 (req.body가 아님)
            const deleteResult = await accountModel.deleteRefreshToken(user_id);
            
            if (deleteResult) {
                return res.status(200).json({ 
                    result: "success", 
                    message: "로그아웃 성공" 
                });
            } else {
                return res.status(200).json({ 
                    result: "fail", 
                    message: "로그아웃 실패" 
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ 
                result: "error", 
                message: "서버 오류"
            });
        }
    },
    //accessToken 재발급
    refresh: async (req, res) => {
        try {
            const refreshToken = req.body.refreshToken;

            if (refreshToken === null) {
                return res.status(401).json({ 
                    result: "fail", 
                    message: "refreshToken이 없습니다." 
                });
            }
            const found = await accountModel.checkRefreshToken(refreshToken);

            if (!found) {
                return res.status(403).json({
                    result: "fail",
                    message: "refreshToken이 유효하지 않습니다."
                });
            } else {
                jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, payload) => {
                    if (err) {
                        return res.status(403).json({
                            result: "fail",
                            message: "refreshToken이 유효하지 않습니다."
                        });
                    } else {
                        const user_id = payload.user_id;
                        let accessToken;
                        await accountModel.getUserById(user_id)
                            .then(res => {
                                userData = res[0];
                                accessToken = generateAccessToken(userData)
                            })
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
    },
    getUserInfo: async (req, res) => {
        try {
            const { password, ...userData } = req.user;

            res.status(200).json({
                result: "success",
                message: "유저 정보 가져오기 성공",
                userData: userData
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ 
                result: "error", 
                message: "서버 오류"
            });
        }
    },

};