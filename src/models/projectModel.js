const db = require('../config/db.js');

module.exports = {
    insertProject: async(user_id, name, ispublic)=>{
        const query = "insert into \"Project\" (user_id, name, ispublic) VALUES ($1, $2, $3)";
        const values = [user_id, name, ispublic];

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