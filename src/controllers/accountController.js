const accountModel = require('../models/accountModel.js');
const mailer = require('../../nodemailer/mailer.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// 회원가입 controller에서 value 생성하는 곳에만 사용
const valueModel = require('../models/valueModel.js');
const transdate = require('../service/transdateService.js');
const { generateAccessToken, generateRefreshToken, generateAuthCode } = require('../service/authService.js');

module.exports = {
    //이메일 인증
    sendMailForRegister: async (req, res) => {
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
                const authCode = generateAuthCode();
                const mailResult = await mailer(email, authCode, 'register');
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
            const userDevice = req.body.device_id;

            //앞에서 확인하긴 했는데 공격에 대비해서 한번 더 확인
            const queryResult = await accountModel.getUserByEmail(email); //이메일로 유저 정보 가져오기
            if (queryResult !== null) {
                return res.status(200).json({
                    result: "fail",
                    message: "이미 가입된 이메일입니다."
                })
            }

            const registerData = req.body; 
            const userData = await accountModel.register(registerData);
            userData.device_id = userDevice;

            //accessToken 처리
            const [accessToken, accessExp] = generateAccessToken(userData);

            // refreshToken 처리
            const [refreshToken, refreshExp] = generateRefreshToken(userData);
            await accountModel.saveRefreshToken(userData.user_id, refreshToken, userDevice); // refreshToken DB에 저장(decive_id가 PK)

            console.log("회원가입 성공");

            // 회원가입 후 자동으로 value 생성
            const settlementTime = transdate.getSettlementTimeInUTC(userData.region);
            await valueModel.createByNewUser(userData.user_id, settlementTime);

            return res.status(200).json({ 
                result: "success",
                accessToken: accessToken, 
                refreshToken: refreshToken,
                accessExp: accessExp,
                refreshExp: refreshExp,
                strategy: userData.strategy
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ 
                result: "error", 
                message: "서버 오류"
            });
        }
    

    },
    //로그인
    login: async (req, res) => {
        try {
            const userData = req.user; // passport를 통해 성공적으로 로그인한 유저 객체
            const userDevice = req.body.device_id;
            userData.device_id = userDevice;

            const [accessToken, accessExp] = generateAccessToken(userData);
            const [refreshToken, refreshExp] = generateRefreshToken(userData);
            await accountModel.saveRefreshToken(userData.user_id, refreshToken, userDevice);

            console.log("로그인 성공");
            return res.status(200).json({ 
                result: "success", 
                accessToken: accessToken, 
                refreshToken: refreshToken,
                accessExp, accessExp,
                refreshExp: refreshExp
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ 
                result: "error", 
                message: "서버 오류"
            });
        }
    }, 
    //소셜 로그인
    loginSocial: async (req, res) => {
        const userData = req.body;
        
        //이미 존재하는지 체크 - 애플은 이메일
        existingUser = await accountModel.getUserByEmail(userData.email);

        if (existingUser === null) { //존재하지 않으면 회원가입
            userData.password = null;
            const registeredUser = await accountModel.register(userData);
            registeredUser.device_id = userData.device_id;
            //accessToken 처리
            const [accessToken, accessExp] = generateAccessToken(registeredUser);

            // refreshToken 처리
            const [refreshToken, refreshExp] = generateRefreshToken(registeredUser);
            await accountModel.saveRefreshToken(registeredUser.user_id, refreshToken, userData.device_id); 

            console.log("회원가입 성공");

            // 회원가입 후 자동으로 value 생성
            const settlementTime = transdate.getSettlementTimeInUTC(registeredUser.region);
            await valueModel.createByNewUser(registeredUser.user_id, settlementTime);

            return res.status(200).json({ 
                result: "success",
                accessToken: accessToken, 
                refreshToken: refreshToken,
                accessExp: accessExp,
                refreshExp: refreshExp,
                strategy: userData.strategy
            });
        } else if (userData.strategy !== 'local') { //존재하고, 소셜 로그인으로 가입한 유저의 경우 로그인
            const userDevice = userData.device_id;
            existingUser.device_id = userDevice;

            const [accessToken, accessExp] = generateAccessToken(existingUser);
            const [refreshToken, refreshExp] = generateRefreshToken(existingUser);
            await accountModel.saveRefreshToken(existingUser.user_id, refreshToken, userDevice);

            console.log("로그인 성공");
            return res.status(200).json({ 
                result: "success", 
                accessToken: accessToken, 
                refreshToken: refreshToken,
                accessExp, accessExp,
                refreshExp: refreshExp
            });
        } else {
            console.log("이미 <이메일로 회원가입>을 통해 가입된 게정입니다.");
            return res.status(200).json({ 
                result: "fail",
                message: "이미 가입된 이메일입니다.",
                strategy: userData.strategy 
            });
        }
        


    },
    //로그아웃
    logout: async (req, res) => {
        try {
            // 로그아웃 시 refreshToken 삭제, accessToken 및 refreshToken은 클라이언트에서 삭제
            const user_id = req.user.user_id; 
            const userDevice = req.user.device_id;
            const deleteResult = await accountModel.deleteRefreshToken(user_id, userDevice);
            
            if (deleteResult) {
                console.log("로그아웃 성공");
                return res.status(200).json({ 
                    result: "success", 
                    message: "로그아웃 성공" 
                });
            } else {
                console.log("로그아웃 실패 - 0개 혹은 2개 이상의 refreshToken이 삭제됨")
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
                console.log("refreshToken 재발급 실패.")
                return res.status(401).json({ 
                    result: "fail", 
                    message: "refreshToken이 없습니다." 
                });
            }
            const decoded = jwt.decode(refreshToken);
            const user_id = decoded.user_id;
            const device_id = decoded.device_id;
            
            const certified = await accountModel.checkRefreshToken(user_id, refreshToken, device_id);
            if (certified === 'noToken') {
                console.log("access token 재발급 실패. refreshToken이 DB에 없습니다.(회원 가입 안돼있거나 로그아웃 상태")
                return res.status(401).json({
                    result: "fail",
                    message: "refreshToken이 DB에 없습니다.(회원 가입 안돼있거나 로그아웃 상태)"   
                });
            } else if (certified == false) {
                console.log("access token 재발급 실패. refreshToken이 일치하지 않습니다.")
                return res.status(401).json({
                    result: "fail",
                    message: "refreshToken이 일치하지 않습니다."
                });
            } else if (certified == true) {
                jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, payload) => {
                    if (err) {
                        console.log("access token 재발급 실패. refrehToken이 유효하지 않습니다. ")
                        return res.status(401).json({
                            result: "fail",
                            message: "refreshToken이 유효하지 않습니다."
                        });
                    } else {
                        console.log("payload에 담긴 user_id:", payload.user_id);
                        const userData = {user_id: payload.user_id};
                        const [accessToken, accessExp] = generateAccessToken(userData);
                        console.log("access token 재발급 성공.");
                        return res.status(200).json({
                            result: "success",
                            message: "accessToken 재발급 성공",
                            accessToken: accessToken,
                            accessExp: accessExp
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
            const user_id = req.user.user_id;
            const queryResult = await accountModel.getUserById(user_id);
            const {password, ...userData} = queryResult[0]

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
    sendMailForFindPassword: async (req, res) => {
        try {
            const email = req.body.email;
            const userData = await accountModel.getUserByEmail(email); //이메일로 유저 정보 가져오기
            if (userData === null) {
                return res.status(200).json({ 
                    result: "fail" ,
                    message: "가입되지 않은 이메일입니다."
                });
            }

            const authCode = generateAuthCode();
            const mailResult = await mailer(email, authCode, 'changePW');

            if (mailResult) {
                const codeId = await accountModel.saveCode(authCode);
                
                return res.status(200).json({ 
                    result: "success", 
                    codeId: codeId
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
    //비밀번호 변경
    changePassowrd: async (req, res) => {
        try {
            const inputData = req.body
            const changeResult = await accountModel.changePasword(inputData);
            if (changeResult) {
                console.log("비밀번호 변경 성공")
                return res.status(200).json({ 
                    result: "success", 
                    message: "비밀번호 변경 성공"
                });
            } else {
                console.log('비밀번호 변경 오류')
                return res.status(200).json({ 
                    result: "fail", 
                    message: "0개 또는 두개 이상의 비밀번호가 변경됨"
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
    // 비밀번호 확인
    confirmPassword: async (req, res) => {
        try {
            const inputPW = req.body.inputPW;
            const savedPW = req.user.password;

            if (await bcrypt.compare(inputPW, savedPW)) {
                console.log("비밀번호 확인 통과")
                return res.status(200).json({
                    result: "success",
                    message: "비밀번호 확인 통과"
                })
            } else {
                console.log("비밀번호 틀림")
                return res.status(200).json({
                    result: "fail",
                    message: "비밀번호 틀림"
                })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ 
                result: "error", 
                message: "서버 오류"
            });
        }
    },
    //회원탈퇴
    unregister: async (req, res) => {
        try {
            const user_id = req.user.user_id;
            const deleteResult = await accountModel.deleteUser(user_id);

            if (deleteResult) {
                console.log("회원탈퇴 성공")
                return res.status(200).json({ 
                    result: "success", 
                    message: "회원탈퇴 성공" 
                });
            } else {
                console.log("회원탈퇴 오류 - 0개 또는 2개 이상의 유저가 삭제됨")
                return res.status(200).json({ 
                    result: "fail", 
                    message: "회원탈퇴 오류 - 0개 또는 2개 이상의 유저가 삭제됨" 
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
    changeTheme: async (req, res) => {
        try {
            const theme = req.body.theme;
            const user_id = req.user.user_id;

            await accountModel.changeTheme(user_id, theme);
            return res.status(200).json({
                result: "success",
                message: "테마 변경 성공"
            }); 
        } catch (error) {
            console.log(error);
            res.status(500).json({ 
                result: "error", 
                message: "서버 내부 오류"
            });
        }
    }
};