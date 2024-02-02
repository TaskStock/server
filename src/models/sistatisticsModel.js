const db = require('../config/db.js');

module.exports = {
    createSistatistics: async(stockitem_id)=>{
        const query = 'insert into "SIStatistics" (stockitem_id) VALUES ($1)';
        const values = [stockitem_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    }
}