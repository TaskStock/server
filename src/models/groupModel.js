const db = require('../config/db.js');

module.exports = {
    ishaveGroup: async(user_id)=>{
        const query = "select group_id from \"User\" where user_id=$1";
        const values = [user_id];

        const group = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return group[0].group_id;   // group이 없으면 null, 있으면 group_id를 반환
    },
    // 그룹 생성
    insertGroup: async(user_id, name, ispublic)=>{
        const query = "insert into \"Group\" (user_id, name, ispublic) VALUES ($1, $2, $3) RETURNING group_id";
        const values = [user_id, name, ispublic];

        const group_id = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0].group_id;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });

        const query2 = "update \"User\" set group_id=$1 where user_id=$2";
        const values2 = [group_id, user_id];

        await db.query(query2, values2)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    statusPeopleNum: async(group_id)=>{
        const query = "select people_count, people_maxnum from \"Group\" where group_id=$1";
        const values = [group_id];

        const group_people = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return group_people[0];
    },
    joinGroup: async(user_id, group_id)=>{
        const query = "update \"User\" set group_id=$1 where user_id=$2";
        const values = [group_id, user_id];

        const query2 = "update \"Group\" set people_count=people_count+1 where group_id=$1";
        const values2 = [group_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });

        await db.query(query2, values2)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
}