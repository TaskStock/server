const db = require('../config/db.js');

module.exports = {
    insertTodo: async(content, level, user_id, project_id)=>{
        const query = "insert into \"Todo\" (content, date, level, user_id, project_id) VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4)";
        const values = [content, level, user_id, project_id];

        await db.query(query, values)
            .then(res => {
                console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    readTodo: async(user_id, date)=>{
        const query = "select * from \"Todo\" where user_id=$1 and DATE(date)=$2";
        const values = [user_id, date];

        const todos = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return todos;
    },
    updateTodo: async(todo_id, content, level, user_id, project_id)=>{
        const query = "update \"Todo\" set content=$1, level=$2, user_id=$3, project_id=$4 where todo_id=$5";
        const values = [content, level, user_id, project_id, todo_id];

        await db.query(query, values)
            .then(res => {
                console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    deleteTodo: async(todo_id, user_id)=>{
        const query = "delete from \"Todo\" where todo_id=$1 and user_id=$2";
        const values = [todo_id, user_id];

        await db.query(query, values)
            .then(res => {
                console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    readTodosUsingProject: async(project_id, user_id)=>{
        const query = "select * from \"Todo\" where user_id=$1 and project_id=$2";
        const values = [user_id, project_id];

        const todos = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return todos;
    },
}