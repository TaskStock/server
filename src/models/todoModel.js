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
}