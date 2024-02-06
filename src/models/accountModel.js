const bcrypt = require('bcrypt');
const { th } = require('date-fns/locale');
const fs = require('fs');

module.exports = {
    saveCode: async(db, authCode) => {
        try {
            const query = 'INSERT INTO "Code" (auth_code) VALUES ($1) RETURNING code_id';
            const code = authCode;
            const {rows} = await db.query(query, [code]); 
            const codeId = rows[0].code_id; 

            return codeId 
        } catch (err) {
            err.name = 'saveCodeError';
            throw err;
        }
    },
    checkCode: async(db, inputData) => {
        try {
            const query = 'SELECT auth_code FROM "Code" WHERE code_id = $1';
            const codeId = inputData.codeId;    
            const {rows} = await db.query(query, [codeId]);
            if (rows.length === 0) {
                return false;
            }

            const authCode = rows[0].auth_code; // 인증코드(string)
            const inputCode = inputData.inputCode; // 사용자가 입력한 코드(string) 

            if (authCode == inputCode) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            err.name = 'checkCodeError';
            throw err;
        }
    },
    deleteCode: async(db, inputData) => {
        const query = 'DELETE FROM "Code" WHERE code_id = $1';
        const code = inputData.codeId;
        try {
            const deleteResult = await db.query(query, [code]);
            
            if (deleteResult.rowCount === 1) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            err.name = 'deleteCodeError';
            throw err;
        }
    },
    register: async(db, registerData) => {
        try {
            let {email, userName, password, isAgree, strategy, userPicture, theme, language, apple_token} = registerData; 
            let user_id;
            let _rows;


            const checkQuery = 'SELECT strategy FROM "User" WHERE email = $1';
            const {rows: checkRows} = await db.query(checkQuery, [email]);
            if (checkRows.length !== 0) {
                const strategy = checkRows[0].strategy;
                let strategyMessage;

                if (strategy === 'kakao') {
                    strategyMessage = '카카오 로그인으로';
                } else if (strategy === 'google') {
                    strategyMessage = '구글 로그인으로';
                } else if (strategy === 'apple') {
                    strategyMessage = '애플 로그인으로';
                } else {
                    strategyMessage = '이메일 로그인으로';
                }

                const message = `${email}은 이미 ${strategyMessage} 가입한 이메일입니다.`
                return {email:false, message:message, strategy:strategy};
            }

            if (password === null) {    //소셜 로그인의 경우
                if (strategy === 'kakao' || strategy === 'google') {
                    const kakaoGoogleQuery = 'INSERT INTO "User" (email, user_name, strategy, image) VALUES ($1, $2, $3, $4) RETURNING *';
                    const {rows} = await db.query(kakaoGoogleQuery, [email, userName, strategy, userPicture])
                    _rows = rows;
                } else if (strategy === 'apple') {
                    const appleQuery = 'INSERT INTO "User" (email, user_name, strategy) VALUES ($1, $2, $3) RETURNING *';
                    const {rows} = await db.query(appleQuery, [email, userName, strategy]);
                    _rows = rows;
                    user_id = _rows[0].user_id;

                    const tokenInsertQuery = 'INSERT INTO "AppleToken" (user_id, apple_token) VALUES ($1, $2)';
                    await db.query(tokenInsertQuery, [user_id, apple_token]);
                }
            } else {    //로컬 로그인의 경우
                // 비밀번호 암호화
                const hashedPassword = await bcrypt.hash(password, 10);
                
                const query = 'INSERT INTO "User" (email, password, user_name) VALUES ($1, $2, $3) RETURNING *';
                const {rows} = await db.query(query, [email, hashedPassword, userName])
                _rows = rows;

            }
            const userData = _rows[0];

            const settingQuery = 'INSERT INTO "UserSetting" (user_id, is_agree, theme, language) VALUES ($1, $2, $3, $4)';
            const defaultSet = [userData.user_id, isAgree, theme, language];

            await db.query(settingQuery, defaultSet)

            return userData;
        } catch (err) {
            err.name = 'registerError';
            throw err;
        }
    },
    saveRefreshToken: async(db, user_id, refreshToken, device_id) => {
        try {
        const selectQuery = 'SELECT * FROM "Token" WHERE user_id = $1 and device_id = $2';
        const {rowCount} = await db.query(selectQuery, [user_id, device_id]);
        if (rowCount === 0) {
            const insertQuery = 'INSERT INTO "Token" (user_id, refresh_token, device_id) VALUES ($1, $2, $3)';
            await db.query(insertQuery, [user_id, refreshToken, device_id])
                .catch(e => {
                    e.name = 'saveRefreshTokenError - insertQueryError';
                    throw e;
                });
        } else {
            const updateQuery = 'UPDATE "Token" SET refresh_token = $1 WHERE user_id = $2 and device_id = $3';
            await db.query(updateQuery, [refreshToken, user_id, device_id])
                .catch(e => {
                    e.name = 'saveRefreshTokenError - updateQueryError';
                    throw e; 
                });
        }
    } catch (err) {
        err.name = 'saveRefreshTokenError';
        throw err;
    }
    },
    getUserByAppleToken: async(db, apple_token) => {
        const query = `
        SELECT * 
        FROM "User" U
        JOIN "AppleToken" A
        ON U.user_id = A.user_id
        WHERE apple_token = $1
        `;
        try {
            const {rows} = await db.query(query, [apple_token]);
            const userData = rows[0];

            if (userData === undefined) {
                return null;
            } else {
                return userData;
            }

        } catch (err) {
            err.name = 'getUserByAppleTokenError';
            throw err;
        }
    },
    getUserByEmail: async(db, email) => { // 로그인 시 이메일(unique)로 유저 정보 가져오기
        try {
            const query = 'SELECT * FROM "User" WHERE email = $1';
            const {rows} = await db.query(query, [email]);
            const userData = rows[0];

            if (userData === undefined) {
                return null;
            } else {
                return userData;
            }
        } catch (err) {
            err.name = 'getUserByEmailError';
            throw err;
        }
    },
    deleteRefreshToken: async(db, user_id, device_id) => {
        const query = 'DELETE FROM "Token" WHERE user_id = $1 and device_id = $2';
        try {
            const {rowCount} = await db.query(query, [user_id, device_id])
            if (rowCount === 1) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            err.name = 'deleteRefreshTokenError';
            throw err;
        }
    },
    getUserById: async(db, user_id) => { //user_id로 유저 전체 정보 + 세팅 정보 가져오기
        const query = `
        SELECT "User".*, "UserSetting".theme, "UserSetting".language, "UserSetting".is_push_on
        FROM "User" 
        INNER JOIN "UserSetting" 
        ON "User".user_id = "UserSetting".user_id 
        WHERE "User".user_id = $1`;
        try {
            const {rows} = await db.query(query, [user_id])
            return rows;
        } catch (err) {
            err.name = 'getUserByIdError';
            throw err;
        }
    },
    getUserNameById: async(db, user_id) => { //user_id로 유저 이름 가져오기
        const query = 'SELECT user_name FROM "User" WHERE user_id = $1';
        try {
            const {rows} = await db.query(query, [user_id])
            return rows[0].user_name;
        } catch (err) {
            err.name = 'getUserNameByIdError';
            throw err;
        }
    },
    checkRefreshToken: async(db, user_id, refreshToken, device_id) => {
        try {
            const query = 'SELECT refresh_token FROM "Token" WHERE user_id = $1 and device_id = $2';
            const {rows} = await db.query(query, [user_id, device_id]);
            if (rows.length === 0) {
                return 'noToken';
            }
            const dbRefreshToken = rows[0].refresh_token; // db에 저장된 refreshToken
            const inputRefreshToken = refreshToken; // 사용자가 입력한 refreshToken

            if (dbRefreshToken === inputRefreshToken) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            err.name = 'checkRefreshTokenError';
            throw err;
        }
    },
    changePasword: async(db, inputData) => {
        try {
            const query = 'UPDATE "User" SET password = $1 WHERE email = $2';
            const {email, password} = inputData;
            const hashedPassword = await bcrypt.hash(password, 10);

            const {rowCount} = await db.query(query, [hashedPassword, email]);
            if (rowCount === 1) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            err.name = 'changePasswordError';
            throw err;
        }
    },
    deleteUser: async(db, user_id) => {
        try {
            const query = 'DELETE FROM "User" WHERE user_id = $1 RETURNING image, strategy';
            const queryResult = await db.query(query, [user_id])
            const {image, strategy} = queryResult.rows[0];

            if (queryResult.rowCount === 1) { // 삭제 성공
                // 팔로우, 팔로잉 관계에 있는 사람들 카운트 조절
                const followingQuery = 'UPDATE "User" SET following_count = following_count - 1 WHERE user_id IN (SELECT follower_id FROM "FollowMap" WHERE following_id = $1)';
                const followerQuery = 'UPDATE "User" SET follower_count = follower_count - 1 WHERE user_id IN (SELECT following_id FROM "FollowMap" WHERE follower_id = $1)';
                await db.query(followingQuery, [user_id]);
                await db.query(followerQuery, [user_id]);

                // 서버에서 프로필 이미지 삭제
                if (strategy === 'local' && image !== '') {
                    fs.promises.unlink(image)
                }

                return true;
            } else {
                return false;        
            } 
        } catch (err) {
            err.name = 'deleteUserError';
            throw err;
        }
    }, 
    // 스케쥴러 위한 모델
    getUsersIdByRegion: async(db, region) => {
        const query = 'select user_id from "User" where region = $1';
        const values = [region];

        const user_ids = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows;
            })
            .catch(err => {
                err.name = 'getUsersIdByRegionError';
                throw err;
            });
        return user_ids;
    },
    // 현재 value 가치, value 상승률 업데이트
    updateValueField: async(db, user_id, cumulative_value, value_yesterday_ago)=>{
        const query = 'update "User" set cumulative_value=$1, value_yesterday_ago=$2 where user_id=$3';
        const values = [cumulative_value, value_yesterday_ago, user_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(err => {
                err.name = 'updateValueFieldError';
                throw err;
            });
    },
    changeTheme: async(db, user_id, theme) => {
        const query = 'UPDATE "UserSetting" SET theme = $1 WHERE user_id = $2';
        try {
            await db.query(query, [theme, user_id])
        } catch (err) {
            err.name = 'changeThemeError';
            throw err;
        }
    },
    getPasswordById: async(db, user_id) => {
        const query = 'SELECT password FROM "User" WHERE user_id = $1';
        try {
            const {rows} = await db.query(query, [user_id])
            return rows[0].password;
        } catch (err) {
            err.name = 'getPasswordByIdError';
            throw err;
        }
    }
}

