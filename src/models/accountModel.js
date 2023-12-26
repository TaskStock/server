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
    checkAvailible: async(emailData) => {
        const query = 'SELECT user_id FROM "User" WHERE email = $1';
        const email = emailData.email;
        console.log(email);

        const {rowCount} = await db.query(query, [email]);
        if(rowCount === 0){ // 가입된 이메일이 없을 경우
            return true;
        }else{  // 가입된 이메일이 있을 경우
            return false;
        }
    },
    saveCode: async(authCode) => {
        const query = 'INSERT INTO "Code" (auth_code) VALUES ($1) RETURNING code_id';
        const code = authCode;
        const {rows} = await db.query(query, [code]); // 구조분해 할당
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
        deleteResult = await db.query(query, [code]);
        
        if (deleteResult.rowCount === 1) {
            return true;
        } else {
            return false;
        }
    },
    register: async(registerData) => {
        const {email, userName, password, isAgree} = registerData;
        // 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, 10);
        
        //email, password user_name, hide, follower_count, following_count, premium, cumulative_value, value_month_age, created_time, image, introduce, group_id, is_agree
        const query = 'INSERT INTO "User" (email, password, user_name, is_agree) VALUES ($1, $2, $3, $4) RETURNING email';
        const {rows} = await db.query(query, [email, hashedPassword, userName, isAgree]);
        
        const user_email = rows[0].email;
        return user_email;
    },
    saveRefreshToken: async(email, refreshToken) => {
        const query = 'INSERT INTO "Token" (email, refresh_token) VALUES ($1, $2) RETURNING email';
        await db.query(query, [email, refreshToken]);
    },
    getUser: async(email) => { // 로그인 시 이메일(unique)로 유저 정보 가져오기
        const query = 'SELECT * FROM "User" WHERE email = $1';
        const {rows} = await db.query(query, [email]);
        const userData = rows[0];
        if (userData === undefined) {
            return null;
        } else {
            return userData;
        }
    },
    deleteRefreshToken: async(email) => {
        const query = 'DELETE FROM "Token" WHERE email = $1';
        const {rowCount} = await db.query(query, [email]);

        if (rowCount === 1) {
            return true;
        } else {
            return false;
        }
    },
}
