const db = require('../config/db.js');

module.exports = {
    insertTodo: async(title, content, level, user_id, project_id)=>{
        const query = "insert into \"Todo\" (title, content, date, level, user_id, project_id) VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5)";
        const values = [title, content, level, user_id, project_id];

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
    updateTodo: async(todo_id, title, content, level, user_id, project_id)=>{
        const query = "update \"Todo\" set title=$1, content=$2, level=$3, user_id=$4, project_id=$5 where todo_id=$6";
        const values = [title, content, level, user_id, project_id, todo_id];

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