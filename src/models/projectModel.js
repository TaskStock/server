module.exports = {
    insertProject: async(db, user_id, name, emoji, public_range)=>{
        const query = "insert into \"Project\" (user_id, name, emoji, public_range) VALUES ($1, $2, $3, $4)";
        const values = [user_id, name, emoji, public_range];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                e.name = 'insertProjectError';
                throw e;
            });
    },
    updateProject: async(db, project_id, user_id, name, emoji, public_range, finished)=>{
        const query = "update \"Project\" set name=$1, emoji=$2, public_range=$3, finished=$4 where user_id=$5 and project_id=$6";
        const values = [name, emoji, public_range, finished, user_id, project_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                e.name = 'updateProjectError';
                throw e;
            });
    },
    finishProject: async(db, project_id, user_id)=>{
        const query = "update \"Project\" set finished=true where user_id=$1 and project_id=$2";
        const values = [user_id, project_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                e.name = 'finishProjectError';
                throw e;
            });
    },
    readProject: async(db, project_id, user_id)=>{
        const query = "select * from \"Project\" where user_id=$1 and project_id=$2";
        const values = [user_id, project_id];

        const project = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0];
            })
            .catch(e => {
                e.name = 'readProjectError';
                throw e;
            });
        return project;
    },
    readAllProjects: async(db, user_id)=>{
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
                e.name = 'readAllProjectsError';
                throw e;
            });
        return projects;
    },
    deleteProject: async(db, project_id, user_id)=>{
        const query = "delete from \"Project\" where user_id=$1 and project_id=$2";
        const values = [user_id, project_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                e.name = 'deleteProjectError';
                throw e;
            });
    },
}