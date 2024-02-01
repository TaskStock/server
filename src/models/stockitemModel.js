const db = require('../config/db.js');

module.exports = {
    insertStockitem: async(name, level, region)=>{
        const query = 'insert into "Stockitem" (name, level, region) VALUES ($1, $2, $3) returning stockitem_id';
        const values = [name, level, region];

        const stockitem_id = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0].stockitem_id;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return stockitem_id;
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
    getStockitemsWithRegion: async(region)=>{
        const query = 'select stockitem_id from "Stockitem" where region = $1';
        const values = [region];

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
    updateStockitemInScheduler: async(stockitem_id)=>{
        // y_take_count, y_success_count 에 오늘 값을 먼저 넣은 후 오늘 값들은 0으로 설정
        const query = 'update "Stockitem" set y_take_count=take_count, y_success_count=success_count, take_count=0, success_count=0 where stockitem_id=$1';
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
    increaseTakecount: async(stockitem_id)=>{
        const query = 'update "Stockitem" set take_count=take_count+1 where stockitem_id=$1 returning take_count, success_count';
        const values = [stockitem_id];

        const stockitem = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return stockitem;
    },
    increaseSuccesscount: async(stockitem_id)=>{
        const query = 'update "Stockitem" set success_count=success_count+1 where stockitem_id=$1 returning take_count, success_count';
        const values = [stockitem_id];

        const stockitem = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return stockitem;
    },
    decreaseSuccesscount: async(stockitem_id)=>{
        const query = 'update "Stockitem" set success_count=success_count-1 where stockitem_id=$1 returning take_count, success_count';
        const values = [stockitem_id];

        const stockitem = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return stockitem;
    },
    decreaseTakecount: async(stockitem_id)=>{
        const query = 'update "Stockitem" set take_count=take_count-1 where stockitem_id=$1 returning take_count, success_count';
        const values = [stockitem_id];

        const stockitem = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return stockitem;
    },
    decreaseTwocount: async(stockitem_id)=>{
        const query = 'update "Stockitem" set take_count=take_count-1, success_count=success_count-1 where stockitem_id=$1 returning take_count, success_count';
        const values = [stockitem_id];

        const stockitem = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return stockitem;
    },
}