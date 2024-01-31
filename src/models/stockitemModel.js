const db = require('../config/db.js');

module.exports = {
    insertStockitem: async(name, level, region)=>{
        const query = 'insert into "Stockitem" (name, level, region) VALUES ($1, $2, $3)';
        const values = [name, level, region];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    updateStockitem: async(stockitem_id, name, level)=>{
        const query = 'update "Stockitem" set name=$1, level=$2 where stockitem_id=$3';
        const values = [name, level, stockitem_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    deleteStockitem: async(stockitem_id)=>{
        const query = 'delete from "Stockitem" where stockitem_id=$1';
        const values = [stockitem_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    getStockitems: async()=>{
        const query = 'select * from "Stockitem"';
        const values = [];

        const stockitems = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return stockitems;
    },
}