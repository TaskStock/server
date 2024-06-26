module.exports = {
    insertRetrospect: async(db, project_id, content, user_id)=>{
        const query = "insert into \"Retrospect\" (project_id, content, user_id) VALUES ($1, $2, $3)";
        const values = [project_id, content, user_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                e.name = "insertRetrospectError";
                throw e;
            });
    },
    updateRetrospect: async(db, retrospect_id, project_id, user_id, content)=>{
        const query = "update \"Retrospect\" set content=$1, project_id=$2 where retrospect_id=$3 and user_id=$4";
        const values = [content, project_id, retrospect_id, user_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                e.name = "updateRetrospectError";
                throw e;
            });
    },
    deleteRestrospect: async(db, retrospect_id, user_id)=>{
        const query = "delete from \"Retrospect\" where retrospect_id=$1 and user_id=$2";
        const values = [retrospect_id, user_id];

        await db.query(query, values)
            .then(res => {
                console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);
                e.name = "deleteRetrospectError";
                throw e;
            });
    },
    getRetrospectCount: async(db, user_id, project_id)=>{
        const query = "select count(*) from \"Retrospect\" where user_id=$1 and project_id=$2";
        const values = [user_id, project_id];

        const count = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0].count;
            })
            .catch(e => {
                e.name = "getRetrospectCountError";
                throw e;
            });
        return count;
    },
    getRetrospectsWithMonth: async(db, user_id, start_date, end_date)=>{
        const query = "select * from \"Retrospect\" where user_id=$1 and created_date>=$2 and created_date<$3";
        const values = [user_id, start_date, end_date];

        const retrospects = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                e.name = "getRetrospectsWithMonthError";
                throw e;
            });
        return retrospects;
    },
    getRetrospectsAll: async(db, user_id, offset, limit, filter, search)=>{
        let query;
        let values;

        if(search === undefined){
            query = `select * from \"Retrospect\" where user_id=$1 order by ${filter} limit $2 offset $3`;
            values = [user_id, limit, offset];
        }else{
            query = `select * from \"Retrospect\" where user_id=$1 and content like $2 order by ${filter} limit $3 offset $4`;
            values = [user_id, search, limit, offset];
        }

        const retrospects = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                e.name = "getRetrospectsAllError";
                throw e;
            });
        return retrospects;
    },
    getRetrospectsWithProject: async(db, user_id, project_id, offset, limit, filter, search)=>{
        let query;
        let values;

        if(search === undefined){
            query = `select * from \"Retrospect\" where user_id=$1 and project_id=$2 order by ${filter} limit $3 offset $4`;
            values = [user_id, project_id, limit, offset];
        }else{
            query = `select * from \"Retrospect\" where user_id=$1 and project_id=$2 and content like $3 order by ${filter} limit $4 offset $5`;
            values = [user_id, project_id, search, limit, offset];
        }

        const retrospects = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                e.name = "getRetrospectsWithProjectError";
                throw e;
            });
        return retrospects;
    },
}