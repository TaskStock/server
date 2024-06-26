module.exports = {
    createSivalue: async(db, stockitem_id, date)=>{
        const query = 'insert into "SIValue" (stockitem_id, date) VALUES ($1, $2)';
        const values = [stockitem_id, date];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                e.name = "createSivalueError";
                throw e;
            });
    },
    updateSuccessrate: async(db, stockitem_id, date, success_rate)=>{
        const query = 'update "SIValue" set success_rate=$1 where stockitem_id=$2 and date=$3 returning sivalue_id';
        const values = [success_rate, stockitem_id, date];

        const sivalue_id = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0].sivalue_id;
            })
            .catch(e => {
                e.name = "updateSuccessrateError";
                throw e;
            });
        return sivalue_id;
    },
    getSivalueOnemonth: async(db, stockitem_id, start_date, end_date)=>{
        const query = 'select success_rate, date from "SIValue" where stockitem_id=$1 and date>$2 and date<=$3 order by date';
        const values = [stockitem_id, start_date, end_date];

        const sivalue = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows;
            })
            .catch(e => {
                e.name = "getSivalueOnemonthError";
                throw e;
            });
        return sivalue;
    },
    getUserlist: async(db, stockitem_id, date)=>{
        const query = `
        select u.user_id, u.user_name, u.image
        from "SIValue" v
            inner join "SIValueMap" svm
                on v.sivalue_id = svm.sivalue_id
            inner join "User" u
                on svm.user_id=u.user_id
        where v.stockitem_id=$1 and v.date=$2
        `;
        const values = [stockitem_id, date];

        const userlist = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows;
            })
            .catch(e => {
                e.name = "getSivalueOnemonthError";
                throw e;
            });
        return userlist;
    },
}