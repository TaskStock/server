const db = require('../config/db.js');

module.exports = {
    insertTodo: async(content, level, user_id, project_id, date, index, stockitem_id)=>{
        const query = "insert into \"Todo\" (content, date, level, user_id, project_id, index, stockitem_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING todo_id, index";
        const values = [content, date, level, user_id, project_id, index, stockitem_id];

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
        const query = "select * from \"Todo\" where user_id=$1 and date>=$2 and date<$3 order by date(date), index";

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
    getTodoCount: async(user_id, project_id)=>{
        const query = "select count(*) from \"Todo\" where user_id=$1 and project_id=$2";
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
    // 스케쥴러 성능을 위해 최소한의 데이터만 전송(level이 0이면 정산 대상이 아니므로 제외)
    readTodoForScheduler: async(db, user_id, start_date, end_date)=>{
        const query = 'select todo_id, "check", level from "Todo" where user_id=$1 and date>=$2 and date<$3 and level != 0';
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
    // check=false만 전송
    readTodoForSchedulerWithCheckFalse: async(db, user_id, start_date, end_date)=>{
        const query = 'select todo_id, "check", level from "Todo" where user_id=$1 and date>=$2 and date<$3 and level != 0 and "check" = false';
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
}