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
    }
}