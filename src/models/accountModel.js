const db = require('../config/db.js');
const bcrypt = require('bcrypt');

module.exports = {
    saveCode: async(authCode) => {
        const query = 'INSERT INTO "Code" (auth_code) VALUES ($1) RETURNING code_id';
        const code = authCode;
        const {rows} = await db.query(query, [code]); 
        const codeId = rows[0].code_id; 
        console.log("코드 db에 저장 완료");
        return codeId 
    },
    checkCode: async(inputData) => {
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
    },
    saveRefreshToken: async(user_id, refreshToken, device_id) => {
        const selectQuery = 'SELECT * FROM "Token" WHERE device_id = $1 and user_id = $2';
        const {rowCount} = await db.query(selectQuery, [device_id, user_id]);
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
    },
    getUserByEmail: async(email) => { // 로그인 시 이메일(unique)로 유저 정보 가져오기
        const query = 'SELECT * FROM "User" WHERE email = $1';
        const {rows} = await db.query(query, [email]);
        const userData = rows[0];

        if (userData === undefined) {
            return null;
        } else {
            return userData;
        }
    },
    deleteRefreshToken: async(user_id) => {
        const query = 'DELETE FROM "Token" WHERE user_id = $1';
        try {
            const {rowCount} = await db.query(query, [user_id])
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
    getUserById: async(user_id) => { //user_id로 유저 정보 가져오기
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
    checkRefreshToken: async(user_id, refreshToken, device_id) => {
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
    },
    changePasword: async(inputData) => {
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
    },
    deleteUser: async(user_id) => {
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
    }, 
}

