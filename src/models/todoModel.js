const db = require('../config/db.js');

module.exports = {
    insertTodo: async(content, level, user_id, project_id, date, index)=>{
        const query = "insert into \"Todo\" (content, date, level, user_id, project_id, index) VALUES ($1, $2, $3, $4, $5, $6) RETURNING todo_id, index";
        const values = [content, date, level, user_id, project_id, index];

        const insert_result = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return insert_result;
    },
    readTodo: async(user_id, start_date, end_date)=>{
        const query = `
        select * 
        from \"Todo\" T
        left join \"Todo_Repeat\" R
            on T.todo_id = R.todo_id
        where user_id=$1 and date>=$2 and date<$3
        order by date(T.date), index
        `;

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
    updateCheck: async(todo_id, user_id, check)=>{
        const query = "update \"Todo\" set \"check\"=$1 where user_id=$2 and todo_id=$3 returning *";
        const values = [check, user_id, todo_id];

        const todo_date = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return todo_date;
    },
    readTodoUsingTodoId: async(todo_id, user_id)=>{
        const query = "select * from \"Todo\" where user_id=$1 and todo_id=$2";
        const values = [user_id, todo_id];

        const todo = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return todo;
    },
    updateTodoDate: async(todo_id, user_id, date)=>{
        const query = "update \"Todo\" set date=$1 where user_id=$2 and todo_id=$3";
        const values = [date, user_id, todo_id];

        await db.query(query, values)
            .then(res => {
                console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    getHighestIndex: async(user_id, start_date, end_date)=>{
        const query = "select \"index\" from \"Todo\" where user_id=$1 and date>=$2 and date<$3 order by index desc limit 1";
        const values = [user_id, start_date, end_date];

        const index = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return index;
    },
    updateIndex: async(todo_id, user_id, index)=>{
        const query = "update \"Todo\" set index=$1 where user_id=$2 and todo_id=$3";
        const values = [index, user_id, todo_id];

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