const db = require('../config/db.js');

module.exports = {
    createByNewUser: async(user_id)=>{
        const query = "insert into \"Value\" (user_id, date) VALUES ($1, CURRENT_TIMESTAMP)";
        const values = [user_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    getRecentValue: async(user_id)=>{
        const query = "select * from \"Value\" where user_id=$1 order by date desc limit 1";
        const values = [user_id];

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
    createByExistUser: async(user_id, percentage, start, end, low, high, combo)=>{
        const query = "insert into \"Value\" (user_id, date, percentage, start, \"end\", low, high, combo) VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4, $5, $6, $7)";
        const values = [user_id, percentage, start, end, low, high, combo];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    getValues: async(user_id, start_date, end_date)=>{
        const query = "select * from \"Value\" where user_id=$1 and date>=$2 and date<$3 order by date";
        const q_values = [user_id, start_date, end_date];

        const values = await db.query(query, q_values)
            .then(res => {
                // console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return values;
    },
}