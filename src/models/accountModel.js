const db = require('../config/db.js');

module.exports = {
    availible: async(emailData) => {
        const query = 'SELECT user_id FROM "User" WHERE email = $1';
        const email = [emailData.email];
        console.log(email);
        const data = await db.query(query, email);
        console.log(data);
        if(data.rowCount === 0){ // 가입된 이메일이 없을 경우
            return true;
        }else{  // 가입된 이메일이 있을 경우
            return false;
        }
    },

    }
