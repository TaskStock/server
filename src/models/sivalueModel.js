const db = require('../config/db.js');

module.exports = {
    createSivalue: async(stockitem_id, date)=>{
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