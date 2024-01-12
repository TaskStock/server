const db = require('../config/db.js');

module.exports = {
    getUserGroupId: async(user_id, group_id)=>{
        const query = "select group_id from \"User\" where user_id=$1 and $2=any(group_id)";
        const values = [user_id, group_id];

        const group = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return group;   // group이 없으면 null, 있으면 group_id를 반환
    },
    // 그룹 생성
    insertGroup: async(user_id, name, ispublic)=>{
        // 트랜잭션 생각, 두 쿼리 합칠 수 있는지 찾아보기

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

        return group_id;
    },
    statusPeopleNum: async(group_id)=>{
        const query = "select people_count, people_maxnum from \"Group\" where group_id=$1";
        const values = [group_id];

        const group_people = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return group_people;
    },
    joinGroup: async(user_id, group_id)=>{
        const query = "update \"User\" set group_id=array_append(group_id, $1) where user_id=$2";
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
    groupRanking: async(group_id)=>{
        const query = "select count(*)+1 as ranking from \"Group\" where value_sum > (select value_sum from \"Group\" where group_id=$1)";
        const values = [group_id];

        const ranking = await db.query(query, values)
            .then(res => {
                return parseInt(res.rows[0].ranking);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return ranking;
    },
    getHeadId: async(group_id)=>{
        const query = "select user_id from \"Group\" where group_id=$1";
        const values = [group_id];

        const head_id = await db.query(query, values)
            .then(res => {
                return res.rows[0].user_id;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return head_id;
    },
    updateHead: async(group_id, user_id)=>{
        const query = "update \"Group\" set user_id=$1 where group_id=$2";
        const values = [user_id, group_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    deleteGroup: async(group_id, user_id)=>{
        const query = "delete from \"Group\" where group_id=$1 and user_id=$2";
        const values = [group_id, user_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    deleteUserGroupId: async(group_id)=>{
        const query = "update \"User\" set group_id=null where group_id=$1";
        const values = [group_id];

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