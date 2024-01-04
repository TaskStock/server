const db = require('../config/db.js');

module.exports = {
    insertTodo: async(content, level, user_id, project_id)=>{
        const query = "insert into \"Todo\" (content, date, level, user_id, project_id) VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4) RETURNING todo_id";
        const values = [content, level, user_id, project_id];

        const todo_id = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0].todo_id;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return todo_id;
    },
    readTodo: async(user_id, start_date, end_date)=>{
        const query = "select * from \"Todo\" where user_id=$1 and date>=$2 and date<$3";
        const values = [user_id, start_date, end_date];

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
    updateContentAndProject: async(todo_id, content, user_id, project_id)=>{
        const query = "update \"Todo\" set content=$1, project_id=$2 where user_id=$3 and todo_id=$4";
        const values = [content, project_id, user_id, todo_id];

        await db.query(query, values)
            .then(res => {
                console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    updateTodo: async(todo_id, content, level, user_id, project_id)=>{
        const query = "update \"Todo\" set content=$1, level=$2, project_id=$3 where user_id=$4 and todo_id=$5 and date > CURRENT_TIMESTAMP - INTERVAL '1 day'";
        const values = [content, level, project_id, user_id, todo_id];

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