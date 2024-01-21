const db = require('../config/db.js');

module.exports = {
    insertProject: async(user_id, name, ispublic)=>{
        const query = "insert into \"Project\" (user_id, name, ispublic) VALUES ($1, $2, $3)";
        const values = [user_id, name, ispublic];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    updateProject: async(project_id, user_id, name, ispublic)=>{
        const query = "update \"Project\" set name=$1, ispublic=$2 where user_id=$3 and project_id=$4";
        const values = [name, ispublic, user_id, project_id];

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
        const query = "select * from \"Project\" where user_id=$1";
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