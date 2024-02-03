const db = require('../config/db.js');

module.exports = {
    createSivalue: async(db, stockitem_id, date)=>{
        const query = 'insert into "SIValue" (stockitem_id, date) VALUES ($1, $2)';
        const values = [stockitem_id, date];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    updateSuccessrate: async(stockitem_id, date, success_rate)=>{
        const query = 'update "SIValue" set success_rate=$1 where stockitem_id=$2 and date=$3';
        const values = [success_rate, stockitem_id, date];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    updateSuccessrateWithUserlist: async(stockitem_id, user_id, date, success_rate, useraction)=>{
        let query;
        if(useraction === 'append'){
            query = 'update "SIValue" set success_rate=$1, user_id=array_append(user_id, $2) where stockitem_id=$3 and date=$4';
        }else if(useraction === 'remove'){
            query = 'update "SIValue" set success_rate=$1, user_id=array_remove(user_id, $2) where stockitem_id=$3 and date=$4';
        }
        const values = [success_rate, user_id, stockitem_id, date];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    isAlreadyStockitem: async(stockitem_id, date, user_id)=>{
        const query = 'select user_id from "SIValue" where stockitem_id=$1 and date=$2 and $3=any(user_id)';
        const values = [stockitem_id, date, user_id];

        const result = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return result;
    },
    // 스케쥴러에 사용
    // getSivalueOne: async(stockitem_id, date)=>{
    //     const query = 'select * from "SIValue" where stockitem_id=$1 and date=$2';
    //     const q_values = [stockitem_id, date];

    //     const sivalue = await db.query(query, q_values)
    //         .then(res => {
    //             // console.log(res.rows[0]);
    //             return res.rows[0];
    //         })
    //         .catch(e => {
    //             console.error(e.stack);

    //             throw e;
    //         });
    //     return sivalue;
    // },
}