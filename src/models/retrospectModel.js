const db = require('../config/db.js');

module.exports = {
    insertRetrospect: async(project_id, content, user_id)=>{
        const query = "insert into \"Retrospect\" (project_id, content, user_id) VALUES ($1, $2, $3)";
        const values = [project_id, content, user_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    updateRetrospect: async(retrospect_id, user_id, content)=>{
        const query = "update \"Retrospect\" set content=$1 where retrospect_id=$2 and user_id=$3";
        const values = [content, retrospect_id, user_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    deleteRestrospect: async(retrospect_id, user_id)=>{
        const query = "delete from \"Retrospect\" where retrospect_id=$1 and user_id=$2";
        const values = [retrospect_id, user_id];

        await db.query(query, values)
            .then(res => {
                console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    getRetrospectCount: async(user_id, project_id)=>{
        const query = "select count(*) from \"Retrospect\" where user_id=$1 and project_id=$2";
        const values = [user_id, project_id];

        const count = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0].count;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return count;
    },
    getRetrospectsWithMonth: async(user_id, start_date, end_date)=>{
        const query = "select * from \"Retrospect\" where user_id=$1 and created_date>=$2 and created_date<$3";
        const values = [user_id, start_date, end_date];

        const retrospects = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return retrospects;
    },
}