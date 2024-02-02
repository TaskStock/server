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
    createByExistUser: async(db, user_id, date, start, end, low, high)=>{
        const query = "insert into \"Value\" (user_id, date, start, \"end\", low, high) VALUES ($1, $2, $3, $4, $5, $6) returning *";
        const values = [user_id, date, start, end, low, high];

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
    updateValueBecauseTodoComplete: async(user_id, change_amount, date)=>{
        // 정산기준으로 value 는 하루에 하나만 있어야한다.
        const query = 'update "Value" set "end"="end"+$1 where user_id=$2 and date=$3 returning start, "end"';
        const q_values = [change_amount, user_id, date];

        const value = await db.query(query, q_values)
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
    updateValue: async(user_id, value_id, start, end, low, high)=>{
        const query = "update \"Value\" set start=$1, \"end\"=$2, low=$3, high=$4 where user_id=$5 and value_id=$6";
        const values = [start, end, low, high, user_id, value_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    // 스케쥴러에 사용
    getValueOne: async(db, user_id, date)=>{
        const query = "select * from \"Value\" where user_id=$1 and date=$2";
        const q_values = [user_id, date];

        const value = await db.query(query, q_values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return value;
    },
    updateValueEnd: async(db, value_id, end)=>{
        const query = 'update "Value" set "end"=$1 where value_id=$2 returning *';
        const q_values = [end, value_id];

        const value = await db.query(query, q_values)
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
    updateValueForMakedTodos: async(db, value_id, end, low, high)=>{
        const query = 'update "Value" set "end"=$1, low=$2, high=$3 where value_id=$4';
        const q_values = [end, low, high, value_id];

        await db.query(query, q_values)
            .then(res => {
                // console.log(res.rows);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
}