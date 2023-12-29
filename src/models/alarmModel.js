const db = require('../config/db.js');

module.exports = {
    insertAlarm: async(user_id, content)=>{
        const query = "insert into \"Alarm\" (user_id, content) VALUES ($1, $2)";
        const values = [user_id, content];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
}