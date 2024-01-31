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
}