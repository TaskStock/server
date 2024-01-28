const db = require('../config/db.js');
const bcrypt = require('bcrypt');

module.exports = {
    saveCode: async(authCode) => {
        try {
            const query = 'INSERT INTO "Code" (auth_code) VALUES ($1) RETURNING code_id';
            const code = authCode;
            const {rows} = await db.query(query, [code]); 
            const codeId = rows[0].code_id; 
            console.log("코드 db에 저장 완료");
            return codeId 
        } catch (e) {
            console.log(e.stack);
            throw e;
        }
    },
    checkCode: async(inputData) => {
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
        } catch (e) {
            console.log(e.stack);
            throw e;
        }
    },
    deleteCode: async(inputData) => {
        const query = 'DELETE FROM "Code" WHERE code_id = $1';
        const code = inputData.codeId;
        try {
            const deleteResult = await db.query(query, [code]);
            
            if (deleteResult.rowCount === 1) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.log(error.stack);
            return false;
        }
    },
    register: async(registerData) => {
        try {
            const {email, userName, password, isAgree, strategy, userPicture, theme, language} = registerData; 
            const defaultImage = 'public/images/ic_profile.png'
            let rows;      
            if (password === null) {    //소셜 로그인의 경우
                const query = 'INSERT INTO "User" (email, user_name, strategy, image) VALUES ($1, $2, $3, $4) RETURNING *';
                const {rows: _rows} = await db.query(query, [email, userName, strategy, userPicture])
                    .catch(e => {
                        console.error(e.stack);
                    });
                rows = _rows;
            
            } else {    //로컬 로그인의 경우
                // 비밀번호 암호화
                const hashedPassword = await bcrypt.hash(password, 10);
                
                const query = 'INSERT INTO "User" (email, password, user_name, image) VALUES ($1, $2, $3, $4) RETURNING *';
                const {rows: _rows} = await db.query(query, [email, hashedPassword, userName, defaultImage])
                    .catch(e => {
                        console.error(e.stack);
                    });
                rows = _rows;
            }
            const userData = rows[0];

            const settingQuery = 'INSERT INTO "UserSetting" (user_id, is_agree, theme, language) VALUES ($1, $2, $3, $4)';
            const defaultSet = [userData.user_id, isAgree, theme, language];

            await db.query(settingQuery, defaultSet)
                .catch(e => {
                    console.error(e.stack);
                });

            return userData;
        } catch (e) {
            console.log(e.stack);
            throw e;
        }
    },
    saveRefreshToken: async(user_id, refreshToken, device_id) => {
        try {
        const selectQuery = 'SELECT * FROM "Token" WHERE user_id = $1 and device_id = $2';
        const {rowCount} = await db.query(selectQuery, [user_id, device_id]);
        if (rowCount === 0) {
            const insertQuery = 'INSERT INTO "Token" (user_id, refresh_token, device_id) VALUES ($1, $2, $3)';
            await db.query(insertQuery, [user_id, refreshToken, device_id])
                .catch(e => {
                    console.error(e.stack);
                });
        } else {
            const updateQuery = 'UPDATE "Token" SET refresh_token = $1 WHERE user_id = $2 and device_id = $3';
            await db.query(updateQuery, [refreshToken, user_id, device_id])
                .catch(e => {
                    console.error(e.stack);
                });
        }
    } catch (e) {
        console.log(e.stack);
        throw e;
    }
    },
    getUserByEmail: async(email) => { // 로그인 시 이메일(unique)로 유저 정보 가져오기
        try {
            const query = 'SELECT * FROM "User" WHERE email = $1';
            const {rows} = await db.query(query, [email]);
            const userData = rows[0];

            if (userData === undefined) {
                return null;
            } else {
                return userData;
            }
        } catch (e) {
            console.log(e.stack);
            throw e;
        }
    },
    deleteRefreshToken: async(user_id, device_id) => {
        const query = 'DELETE FROM "Token" WHERE user_id = $1 and device_id = $2';
        try {
            const {rowCount} = await db.query(query, [user_id, device_id])
            if (rowCount === 1) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            console.log(e.stack);
            return false;
        }
    },
    getUserById: async(user_id) => { //user_id로 유저 전체 정보 가져오기
        const query = `
        SELECT "User".*, "UserSetting".theme, "UserSetting".language 
        FROM "User" 
        INNER JOIN "UserSetting" 
        ON "User".user_id = "UserSetting".user_id 
        WHERE "User".user_id = $1`;
        try {
            const {rows} = await db.query(query, [user_id])
            return rows;
        } catch (e) {
            console.log(e.stack);
        }
    },
    getUserNameById: async(user_id) => { //user_id로 유저 이름 가져오기
        const query = 'SELECT user_name FROM "User" WHERE user_id = $1';
        try {
            const {rows} = await db.query(query, [user_id])
            return rows[0].user_name;
        } catch (e) {
            console.log(e.stack);
            return 
        }
    },
    checkRefreshToken: async(user_id, refreshToken, device_id) => {
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
        } catch (e) {
            console.log(e.stack);
            throw e;
            return false;
        }
    },
    changePasword: async(inputData) => {
        try {
            const query = 'UPDATE "User" SET password = $1 WHERE email = $2';
            const {email, password} = inputData;
            const hashedPassword = await bcrypt.hash(password, 10);

            const {rowCount} = await db.query(query, [hashedPassword, email])
                                .catch(e => {
                                    console.error(e.stack);
                                });
            if (rowCount === 1) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            console.log(e.stack);
            throw e;
        }
    },
    deleteUser: async(user_id) => {
        try {
            const query = 'DELETE FROM "User" WHERE user_id = $1';
            const {rowCount} = await db.query(query, [user_id])
                                .catch(e => {
                                    console.error(e.stack);
                                });
            if (rowCount === 1) {
                return true;
            } else {
                return false;        
            } 
        } catch (e) {
            console.log(e.stack);
            throw e;
        }
    }, 
    // 스케쥴러 위한 모델
    getUsersIdByRegion: async(region) => {
        const query = 'select user_id from "User" where region = $1';
        const values = [region];

        const user_ids = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return user_ids;
    },
}

