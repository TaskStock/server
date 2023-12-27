const db = require('../config/db.js');

module.exports = {
    createByNewUser: async(user_id, date)=>{
        const query = "insert into \"Value\" (user_id, date) VALUES ($1, $2)";
        const values = [user_id, date];

        const group = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
}