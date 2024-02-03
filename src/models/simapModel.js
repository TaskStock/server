const db = require('../config/db.js');

module.exports = {
    getSimapid: async(user_id, stockitem_id)=>{
        const query = 'select simap_id from "SIMap" where user_id=$1 and stockitem_id=$2';
        const values = [user_id, stockitem_id];

        const simap_id = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0];
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return simap_id;
    },
    createSimap: async(user_id, stockitem_id)=>{
        const query = 'insert into "SIMap" (user_id, stockitem_id) VALUES ($1, $2)';
        const values = [user_id, stockitem_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    increaseTakecount: async(simap_id)=>{
        const query = 'update "SIMap" set take_count=take_count+1 where simap_id=$1';
        const values = [simap_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    decreaseTakecount: async(simap_id)=>{
        const query = 'update "SIMap" set take_count=take_count-1 where simap_id=$1';
        const values = [simap_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    increaseSuccesscount: async(user_id, stockitem_id)=>{
        const query = 'update "SIMap" set success_count=success_count+1 where user_id=$1 and stockitem_id=$2';
        const values = [user_id, stockitem_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    decreaseSuccesscount: async(user_id, stockitem_id)=>{
        const query = 'update "SIMap" set success_count=success_count-1 where user_id=$1 and stockitem_id=$2';
        const values = [user_id, stockitem_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    decreaseTwocount: async(user_id, stockitem_id)=>{
        const query = 'update "SIMap" set take_count=take_count-1, success_count=success_count-1 where user_id=$1 and stockitem_id=$2';
        const values = [user_id, stockitem_id];

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