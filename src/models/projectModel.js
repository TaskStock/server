const db = require('../config/db.js');

module.exports = {
    insertProject: async(user_id, name, public_range)=>{
        const query = "insert into \"Project\" (user_id, name, public_range) VALUES ($1, $2, $3)";
        const values = [user_id, name, public_range];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    updateProject: async(project_id, user_id, name, public_range, finished)=>{
        const query = "update \"Project\" set name=$1, public_range=$2, finished=$3 where user_id=$4 and project_id=$5";
        const values = [name, public_range, finished, user_id, project_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    readProject: async(project_id, user_id)=>{
        const query = "select * from \"Project\" where user_id=$1 and project_id=$2";
        const values = [user_id, project_id];

        const project = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return project;
    },
    readAllProjects: async(user_id)=>{
        // 서브쿼리할때 Todo와 Retrospect 테이블에 인덱스 추가해서 성능 높일 수 있을듯
        const query = `
        select *,
            (select count(*)
            from \"Todo\" T
            where T.project_id = P.project_id)::INTEGER todo_count,
            (select count(*)
            from \"Retrospect\" R
            where R.project_id = P.project_id)::INTEGER retrospect_count
        from \"Project\" P
        where user_id=$1
        `;
        const values = [user_id];

        const projects = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return projects;
    },
    deleteProject: async(project_id, user_id)=>{
        const query = "delete from \"Project\" where user_id=$1 and project_id=$2";
        const values = [user_id, project_id];

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