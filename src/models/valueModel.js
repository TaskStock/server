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
    updateValueBecauseTodoComplete: async(user_id, change_amount, start_date, end_date)=>{
        // 정산기준으로 value 는 하루에 하나만 있어야한다.
        const query = "update \"Value\" set start=start+$1 where user_id=$2 and date>=$3 and date<$4";
        const values = [change_amount, user_id, start_date, end_date];

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