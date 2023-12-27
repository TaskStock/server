const db = require('../config/db.js');

module.exports = {
    createByNewUser: async(user_id, date)=>{
        const query = "insert into \"Value\" (user_id, date) VALUES ($1, $2)";
        const values = [user_id, date];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    getRecentValue: async(user_id, date)=>{
        const query = "select * from \"Value\" where user_id=$1 and date<$2 order by date desc limit 1";
        const values = [user_id, date];

        const value = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return value;
    },
    createByExistUser: async(user_id, date, percentage, start, end, low, high, combo)=>{
        const query = "insert into \"Value\" (user_id, date, percentage, start, \"end\", low, high, combo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
        const values = [user_id, date, percentage, start, end, low, high, combo];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
}