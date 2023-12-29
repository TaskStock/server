const db = require('../config/db.js');

module.exports = {
    insertAlarm: async(user_id, content)=>{
        const query = "insert into \"Alarm\" (user_id, content) VALUES ($1, $2)";
        const values = [user_id, content];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    // 안읽은 것 먼저, 최신순
    readAlarms: async(user_id)=>{
        const query = "select * from \"Alarm\" where user_id=$1 order by isread, created_date desc";
        const values = [user_id];

        const alarms = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        
        return alarms;
    },
    readAlarmAndUpdateIsread: async(alarm_id, user_id)=>{
        // 원래 읽고 isread를 업데이트하는게 맞지만 쿼리횟수를 줄이고 isread는 크게 중요하지 않기 때문에 다음의 쿼리를 사용
        const query = "update \"Alarm\" set isread=true where user_id=$1 and alarm_id=$2 returning *";
        const values = [user_id, alarm_id];

        const alarm = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        
        return alarm;
    },
}