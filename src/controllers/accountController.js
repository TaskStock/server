const accountModel = require('../models/accountModel.js');
const badgeModel = require('../models/badgeModel.js');
const noticeModel = require('../models/noticeModel.js');
const noticeService = require('../service/noticeService.js');
const mailer = require('../../nodemailer/mailer.js');
const snsModel = require('../models/snsModel.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db.js');
const {bucket} = require('../config/multerConfig.js');


// 회원가입 controller에서 value 생성하는 곳에만 사용
const valueModel = require('../models/valueModel.js');
const transdate = require('../service/transdateService.js');
const { generateAccessToken, generateRefreshToken, generateAuthCode } = require('../service/authService.js');

module.exports = {
    //이메일 인증
    sendMailForRegister: async (req, res, next) => {
        try {
            const email = req.body.email;
            const userData = await accountModel.getUserByEmail(db, email); //이메일로 유저 정보 가져오기

            const availible = (userData === null) ? true : false;
            if (!availible) {
                return res.status(200).json({ 
                    result: "fail" ,
                    message: "이미 가입된 이메일입니다.",
                    strategy: userData.strategy 
                });
            } else {
                const authCode = generateAuthCode();
                const mailResult = await mailer(email, authCode, 'register');
                if (mailResult) {
                    const codeId = await accountModel.saveCode(db, authCode);
                    return res.status(200).json({ 
                        result: "success", 
                        codeId: codeId
                    });
                }
            } 
        } catch (err) {
            next(err)
            
        }
    },
    //인증코드 확인
    checkCode: async (req, res, next) => {
        const cn = await db.connect();
        try {
            await cn.query('BEGIN');

            const inputData = req.body;
            const checkResult = await accountModel.checkCode(cn, inputData);    
            
            if (checkResult) {
                
                const wellDeleted = await accountModel.deleteCode(cn, inputData);

                if (!wellDeleted) {
                    await cn.query('ROLLBACK')
                    return res.status(200).json({ 
                        result: "success"
                    });
                }
                await cn.query('COMMIT');
                return res.status(200).json({ 
                    result: "success"
                });
            } else {
                await cn.query('ROLLBACK')
                return res.status(200).json({ 
                    result: "fail", 
                    message: "인증코드가 일치하지 않음" 
                });
            }
        } catch (err) {
            await cn.query('ROLLBACK')
            next(err)
            
        } finally {
            cn.release();
        }
    },
    //이메일 회원가입
    register: async (req, res, next) => {
        const cn = await db.connect();
        try {
            await cn.query('BEGIN');

            const userDevice = req.body.device_id;

            const registerData = req.body; 
            const userData = await accountModel.register(cn, registerData);
            if (userData.email === false) {
                await cn.query('ROLLBACK');
                return res.status(200).json({
                    result: "fail",
                    message: userData.message,
                    strategy: userData.strategy
                });
            };

            userData.device_id = userDevice;
            //accessToken 처리
            const [accessToken, accessExp] = generateAccessToken(userData);

            // refreshToken 처리
            const [refreshToken, refreshExp] = generateRefreshToken(userData);
            await accountModel.saveRefreshToken(cn, userData.user_id, refreshToken, userDevice); // refreshToken DB에 저장(decive_id가 PK)

            // 회원가입 후 자동으로 value 생성
            const settlementTime = transdate.getSettlementTimeInUTC(userData.region);
            const value = await valueModel.createByNewUser(cn, userData.user_id, settlementTime);
            await accountModel.updateValueField(cn, userData.user_id, value.start, 50000);

            await cn.query('COMMIT');
            return res.status(200).json({ 
                result: "success",
                accessToken: accessToken, 
                refreshToken: refreshToken,
                accessExp: accessExp,
                refreshExp: refreshExp,
                strategy: userData.strategy
            });

        } catch (err) {
            next(err);  
            await cn.query('ROLLBACK');
            
        } finally {
            cn.release();
        }
    },
    //로그인
    login: async (req, res, next) => {
        try {
            const userData = req.user; // passport를 통해 성공적으로 로그인한 유저 객체
            const userDevice = req.body.device_id;
            userData.device_id = userDevice;
            
            const [accessToken, accessExp] = generateAccessToken(userData);
            const [refreshToken, refreshExp] = generateRefreshToken(userData);
            await accountModel.saveRefreshToken(db, userData.user_id, refreshToken, userDevice);

            return res.status(200).json({ 
                result: "success", 
                accessToken: accessToken, 
                refreshToken: refreshToken,
                accessExp, accessExp,
                refreshExp: refreshExp
            });
        } catch (err) {
            next(err)
            
        }
    }, 
    //소셜 로그인
    loginSocial: async (req, res, next) => {
        const cn = await db.connect();
        try {
            await cn.query('BEGIN');
            const userData = req.body;
            
            let existingUser;
            //이미 존재하는지 체크 - 애플은 별도로 처리
            if (userData.strategy !== 'apple') {
                existingUser = await accountModel.getUserByEmail(cn, userData.email);
            } else {
                existingUser = await accountModel.getUserByAppleToken(cn, userData.apple_token);
            }
            if (existingUser === null) { //존재하지 않으면 회원가입
                userData.password = null;
                const registeredUser = await accountModel.register(cn, userData);
                if (registeredUser.email === false) {
                    await cn.query('ROLLBACK');
                    return res.status(200).json({
                        result: "fail",
                        message: registeredUser.message,
                        strategy: registeredUser.strategy
                    });
                };

                registeredUser.device_id = userData.device_id;
                
                //accessToken 처리
                const [accessToken, accessExp] = generateAccessToken(registeredUser);

                // refreshToken 처리
                const [refreshToken, refreshExp] = generateRefreshToken(registeredUser);
                await accountModel.saveRefreshToken(cn, registeredUser.user_id, refreshToken, userData.device_id, db); 

                // 회원가입 후 자동으로 value 생성
                const settlementTime = transdate.getSettlementTimeInUTC(registeredUser.region);
                const value = await valueModel.createByNewUser(cn, registeredUser.user_id, settlementTime);
                await accountModel.updateValueField(cn, registeredUser.user_id, value.start, 50000);

                await cn.query('COMMIT');

                return res.status(200).json({ 
                    result: "success",
                    accessToken: accessToken, 
                    refreshToken: refreshToken,
                    accessExp: accessExp,
                    refreshExp: refreshExp,
                    strategy: userData.strategy
                });
            } else if (userData.strategy !== 'local' && existingUser.strategy == userData.strategy) { //존재하고, 소셜 로그인으로 가입한 유저의 경우 로그인
                const userDevice = userData.device_id;
                existingUser.device_id = userDevice;

                const [accessToken, accessExp] = generateAccessToken(existingUser);
                const [refreshToken, refreshExp] = generateRefreshToken(existingUser);
                await accountModel.saveRefreshToken(cn, existingUser.user_id, refreshToken, userDevice);


                await cn.query('COMMIT');

                return res.status(200).json({ 
                    result: "success", 
                    accessToken: accessToken, 
                    refreshToken: refreshToken,
                    accessExp, accessExp,
                    refreshExp: refreshExp
                });
            } else {

                await cn.query('ROLLBACK');

                return res.status(200).json({ 
                    result: "fail",
                    message: "이미 가입된 이메일입니다.",
                    strategy: existingUser.strategy 
                });
            }
        } catch (err) {
            await cn.query('ROLLBACK');
            next(err);
            
        } finally {
            cn.release();   
        }
    },
    //로그아웃
    logout: async (req, res, next) => {
        try {
            // 로그아웃 시 refreshToken 삭제, accessToken 및 refreshToken은 클라이언트에서 삭제
            const user_id = req.user.user_id; 
            const userDevice = req.user.device_id;
            const deleteResult = await accountModel.deleteRefreshToken(db, user_id, userDevice);
            
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
        } catch (err) {
            next(err);
            
        }
    },
    //accessToken 재발급
    refresh: async (req, res, next) => {
        try {
            const refreshToken = req.body.refreshToken;
            
            if (refreshToken === null) {
                return res.status(401).json({ 
                    result: "fail", 
                    message: "refreshToken이 없습니다." 
                });
            }
            const decoded = jwt.decode(refreshToken);
            const user_id = decoded.user_id;
            const device_id = decoded.device_id;

            const certified = await accountModel.checkRefreshToken(db, user_id, refreshToken, device_id);
            if (certified === 'noToken') {
                // console.log("access token 재발급 실패. refreshToken이 DB에 없습니다.(회원 가입 안돼있거나 로그아웃 상태")
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
                        // console.log("access token 재발급 실패. refrehToken이 유효하지 않습니다. ")
                        return res.status(401).json({
                            result: "fail",
                            message: "refreshToken이 유효하지 않습니다."
                        });
                    } else {
                        const userData = {user_id: payload.user_id , device_id: payload.device_id, region: payload.region};
                        const [accessToken, accessExp] = generateAccessToken(userData);
                        // console.log("access token 재발급 성공.");
                        return res.status(200).json({
                            result: "success",
                            message: "accessToken 재발급 성공",
                            accessToken: accessToken,
                            accessExp: accessExp
                        });
                    }
                });
            }
        } catch (err) {
            next(err);
            
        }
    },
    getUserInfo: async (req, res, next) => {
        const cn = await db.connect();
        try {
            await cn.query('BEGIN');

            const user_id = req.user.user_id;
            const queryResult = await accountModel.getUserById(cn, user_id); //array
            const badges = await badgeModel.getBadges(cn, user_id); //array
            const is_new_notice = await noticeModel.checkNewNotice(cn, user_id); //boolean

            const {password, ...userData} = queryResult[0];
            userData.is_new_notice = is_new_notice;

            if(userData.dormant_count !== 0){
                await accountModel.initializeDormantCount(cn, user_id);
                userData.dormant_count = 0;
            }

            await cn.query('COMMIT');
            res.status(200).json({
                result: "success",
                message: "유저 정보 가져오기 성공",
                userData: userData,
                badges: badges
            });
        } catch (err) {
            await cn.query('ROLLBACK');
            next(err);
        }finally{
            cn.release();
        }
    },
    sendMailForFindPassword: async (req, res, next) => {
        try {
            const email = req.body.email;
            const userData = await accountModel.getUserByEmail(db, email); //이메일로 유저 정보 가져오기
            if (userData === null) {
                return res.status(200).json({ 
                    result: "fail" ,
                    message: "가입되지 않은 이메일입니다."
                });
            }
            if (userData.strategy !== 'local') {
                return res.status(200).json({ 
                    result: "social" ,
                    message: "소셜 로그인으로 가입된 계정입니다."
                });
            }

            const authCode = generateAuthCode();
            const mailResult = await mailer(email, authCode, 'changePW');

            if (mailResult) {
                const codeId = await accountModel.saveCode(db, authCode);
                
                return res.status(200).json({ 
                    result: "success", 
                    codeId: codeId
                });
            } 
        } catch (err) {
            next(err);
            
        }
    },
    //비밀번호 변경
    changePassowrd: async (req, res, next) => {
        try {
            const inputData = req.body
            const changeResult = await accountModel.changePasword(db, inputData);
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
        } catch (err) {
            next(err);
        }    
    },
    // 비밀번호 확인
    confirmPassword: async (req, res, next) => {
        try {
            const inputPW = req.body.inputPW;
            
            const user_id = req.user.user_id;
            const savedPW = await accountModel.getPasswordById(db, user_id);

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
        } catch (err) {
            next(err)
        }
    },
    //회원탈퇴
    unregister: async (req, res, next) => {
        cn = await db.connect();
        try {
            await cn.query('BEGIN');
            const user_id = req.user.user_id;
            const content = req.body.content;
            const email = 'unregister'
            

            await noticeModel.saveCustomerSuggestion(cn, user_id, content, email);
            
            const deleteResult = await accountModel.deleteUser(cn, user_id);
            
            if (deleteResult) {
                // 서버에서 프로필 이미지 삭제
                const beforeUrl = await snsModel.checkUserImage(cn, user_id);
                console.log(beforeUrl);
                // 'taskstock-bucket-1'이 문자열에 포함되어 있는지 확인
                const intTheBucket = beforeUrl.includes("taskstock-bucket-1");
                if (beforeUrl && intTheBucket) {

                    const lastSlashIndex = beforeUrl.lastIndexOf('/') + 1; // 마지막 슬래시 위치 다음 인덱스
                    const beforeFilename = beforeUrl.substring(lastSlashIndex); // 마지막 슬래시 이후 문자열 추출
                    const beforeBlob = bucket.file(beforeFilename);
                    try {
                        await beforeBlob.delete();
                    } catch (err) {
                        next(err);
                    }

                }
                const noticeData = {
                    type: 'customer.suggestion',
                    user_id: user_id,
                    content: content,
                    email: email
                }
                
                await noticeService.sendSlack(noticeData);

                await cn.query('COMMIT');
                console.log("회원탈퇴 성공")
                return res.status(200).json({ 
                    result: "success", 
                });
            } else {
                await cn.query('ROLLBACK');
                console.log("회원탈퇴 오류 - 0개 또는 2개 이상의 유저가 삭제됨")
                return res.status(200).json({ 
                    result: "fail", 
                });
            }
        } catch (err) {
            await cn.query('ROLLBACK');
            next(err);
            
        } finally {
            cn.release();
        }
    },
    changeTheme: async (req, res, next) => {
        try {
            const theme = req.body.theme;
            const user_id = req.user.user_id;

            await accountModel.changeTheme(db, user_id, theme);
            return res.status(200).json({
                result: "success",
                message: "테마 변경 성공"
            }); 
        } catch (error) {
            next(err);
        }
    }
};