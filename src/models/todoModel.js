const db = require('../config/db.js');

module.exports = {
    insertTodo: async(t_data)=>{
        const title = t_data.title;
        const content = t_data.content;
        // const date = t_data.date;    일단은 오늘 날짜만 todo 생성할 수 있음
        const level = t_data.level;
        const user_id = t_data.user_id;
        const project_id = t_data.project_id;

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
    readTodo: async(t_data)=>{
        const user_id = t_data.user_id;
        const date = t_data.date;   // 클라이언트로부터 받은 시간 정보를 UTC 기준으로 변환한 후 년,월,일까지 저장 ex. 2023-12-24

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
    updateTodo: async(t_data)=>{
        const todo_id = t_data.todo_id;
        const title = t_data.title;
        const content = t_data.content;
        const level = t_data.level;
        const user_id = t_data.user_id;
        const project_id = t_data.project_id;

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
}