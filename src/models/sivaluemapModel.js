module.exports = {
    insertMapping: async(db, user_id, sivalue_id)=>{
        const query = 'insert into "SIValueMap" (user_id, sivalue_id) values ($1, $2)';
        const values = [user_id, sivalue_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    deleteMapping: async(db, user_id, sivalue_id)=>{
        const query = 'delete from "SIValueMap" where user_id=$1 and sivalue_id=$2';
        const values = [user_id, sivalue_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    // 조건에 맞으면 길이가 1이상, 조건에 안맞으면 길이가 0
    getMapping: async(db, stockitem_id, sttime, user_id)=>{
        const query = `
        select svm.sivaluemap_id 
        from "SIValueMap" svm
            inner join "SIValue" sv
            on svm.sivalue_id = sv.sivalue_id
        where sv.stockitem_id=$1 and sv.date=$2 and svm.user_id=$3
        `;
        const values = [stockitem_id, sttime, user_id];

        const sivaluemap = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return sivaluemap;
    },
    getUserlist: async(db, sivalue_id)=>{
        const query = 'select user_id from "SIValueMap" where sivalue_id=$1';
        const values = [sivalue_id];

        const userlist = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return userlist;
    },
}