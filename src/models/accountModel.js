/*
{
    command: 'SELECT',
    rowCount: 3, // 반환된 행의 수
    oid: null,   // 대부분의 경우 사용하지 않음
    rows: [      // 실제 데이터를 포함하는 배열
        { id: 1, username: 'user1', email: 'user1@example.com' },
        { id: 2, username: 'user2', email: 'user2@example.com' },
        { id: 3, username: 'user3', email: 'user3@example.com' }
    ],
    fields: [    // 반환된 각 열에 대한 정보를 포함하는 객체의 배열
        { name: 'id', tableID: 12345, columnID: 1, dataTypeID: 23, ... },
        { name: 'username', tableID: 12345, columnID: 2, dataTypeID: 1043, ... },
        { name: 'email', tableID: 12345, columnID: 3, dataTypeID: 1043, ... }
}
*/
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
            
            const query = 'INSERT INTO "User" (email, password, user_name) VALUES ($1, $2, $3) RETURNING *';
            const {rows: _rows} = await db.query(query, [email, hashedPassword, userName])
                .catch(e => {
                    console.error(e.stack);
                });
            rows = _rows;
        }
        const userData = rows[0];

        // 회원가입 도중 이탈하는 경우를 대비해 기본 설정을 저장
        const settingQuery = 'INSERT INTO "UserSetting" (user_id, is_agree, theme, language) VALUES ($1, $2, $3, $4)';
        const defaultSet = [userData.user_id, isAgree, theme, language];

        await db.query(settingQuery, defaultSet)
            .catch(e => {
                console.error(e.stack);
            });

        return userData;
    },
    saveRefreshToken: async(user_id, refreshToken) => {
        const selectQuery = 'SELECT * FROM "Token" WHERE user_id = $1';
        const {rowCount} = await db.query(selectQuery, [user_id]);
        if (rowCount === 0) {
            const insertQuery = 'INSERT INTO "Token" (user_id, refresh_token) VALUES ($1, $2)';
            await db.query(insertQuery, [user_id, refreshToken])
                .catch(e => {
                    console.error(e.stack);
                });
        } else {
            const updateQuery = 'UPDATE "Token" SET refresh_token = $1 WHERE user_id = $2';
            await db.query(updateQuery, [refreshToken, user_id])
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
            console.log(rowCount)
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
        const query = 'SELECT * FROM "User" WHERE user_id = $1';

        const user = await db.query(query, [user_id])
            .then(res => {
                // console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return user;
    },
    getUserData: async(user_id) => {
        const query = 'SELECT * FROM "User" WHERE user_id = $1';
        const values = [user_id];

        const user = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return user;
    },
    checkRefreshToken: async(refreshToken) => {
        const query = 'SELECT refresh_token FROM "Token" WHERE refresh_token = $1';
        const {rows} = await db.query(query, [refreshToken]);

        if (rows.length === 0) { //토큰이 DB에 없는 경우
            return false;
        } else {    //토큰이 DB에 있는 경우
        return true;
        }
    },
}
    //초기 설정 저장
//     createSetting: async(settingData) => {
//         const {user_id, isAgree, theme, language} = settingData;
//         const query = 'UPDATE "UserSetting" SET is_agree = $2, theme = $3, language = $4 WHERE user_id = $1';

//         await db.query(query, [user_id, isAgree, theme, language])
//             .catch(e => {
//                 console.error(e.stack);
//             });
//     }

