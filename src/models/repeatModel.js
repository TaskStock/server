const db = require('../config/db.js');

module.exports = {
    newRepeat: async(region, end_time, repeat_pattern, todo_id)=>{
        const query = "insert into \"Todo_Repeat\" (region, end_time, repeat_pattern, todo_id) VALUES ($1, $2, $3, $4)";
        const values = [region, end_time, repeat_pattern, todo_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    getRepeat: async(todo_id)=>{
        const query = "select repeat_id from \"Todo_Repeat\" where todo_id=$1";
        const values = [todo_id];

        const repeat_object = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });

        return repeat_object;
    },
    updateRepeat: async(end_time, repeat_pattern, todo_id)=>{
        const query = "update \"Todo_Repeat\" set end_time=$1, repeat_pattern=$2 where todo_id=$3";
        const values = [end_time, repeat_pattern, todo_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    deleatRepeat: async(todo_id)=>{
        const query = "delete from \"Todo_Repeat\" where todo_id=$1";
        const values = [todo_id];

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