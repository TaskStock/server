const db = require('../config/db.js');

module.exports = {
    availible: async(emailData) => {
        const query = 'SELECT user_id FROM "User" WHERE email = $1';
        const email = [emailData.email];
        console.log(email);
        const data = await db.query(query, email);
        
        if(data.length === 0){
            return true;
        }else{
            return false;
        }
    },

    }
