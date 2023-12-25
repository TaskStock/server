const db = require('../config/db.js');

module.exports = {
    checkAvailible: async(emailData) => {
        const query = 'SELECT user_id FROM "User" WHERE email = $1';
        const email = [emailData.email];
        console.log(email);
        const result = await db.query(query, email);
        if(result.rowCount === 0){ // 가입된 이메일이 없을 경우
            return true;
        }else{  // 가입된 이메일이 있을 경우
            return false;
        }
    },
    saveCode: async(authCode) => {
        const query = 'INSERT INTO "Code" (auth_code) VALUES ($1) RETURNING code_id';
        const code = [authCode];
        const {rows} = await db.query(query, code); // 구조분해 할당
        const codeId = rows[0].code_id; 
        console.log("코드 db에 저장 완료");
        return codeId 
    },
    checkCode: async(inputData) => {
        const query = 'SELECT auth_code FROM "Code" WHERE code_id = $1';
        const codeId = [inputData.codeId];
        const {rows} = await db.query(query, codeId);

        const authCode = rows[0].auth_code; // 인증코드
        const inputCode = inputData.inputCode; // 사용자가 입력한 코드

        if (authCode == inputCode) {
            return true;
        } else {
            return false;
        }
    },
    deleteCode: async(inputData) => {
        const query = 'DELETE FROM "Code" WHERE code_id = $1';
        const code = [inputData.codeId];
        deleteResult = await db.query(query, code);
        
        if (deleteResult.rowCount === 1) {
            return true;
        } else {
            return false;
        }
    },
}
