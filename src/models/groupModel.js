const db = require('../config/db.js');

module.exports = {
    ishaveGroup: async(user_id)=>{
        const query = "select group_id from \"User\" where user_id=$1";
        const values = [user_id];

        const group = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return group[0].group_id;   // group이 없으면 null, 있으면 group_id를 반환
    },
    insertGroup: async(user_id, name, ispublic)=>{
        const query = "insert into \"Group\" (user_id, name, ispublic) VALUES ($1, $2, $3)";
        const values = [user_id, name, ispublic];

        await db.query(query, values)
            .then(res => {
                console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
}