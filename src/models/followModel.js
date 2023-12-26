const db = require('../config/db.js');

module.exports = {
    newMapping: async(user_id, followed_id)=>{
        const query = "insert into \"FollowMap\" (user_id, followed_id) VALUES ($1, $2)";
        const values = [user_id, followed_id];

        await db.query(query, values)
            .then(res => {
                console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    deleteMapping: async(user_id, followed_id)=>{
        const query = "delete from \"FollowMap\" where user_id=$1 and followed_id=$2";
        const values = [user_id, followed_id];

        await db.query(query, values)
            .then(res => {
                console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    }
}