module.exports = {
    getSimap: async(db, user_id, stockitem_id)=>{
        const query = 'select stockitem_id from "SIMap" where user_id=$1 and stockitem_id=$2';
        const values = [user_id, stockitem_id];

        const simap = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows[0];
            })
            .catch(e => {
                e.name = "getSimapError";
                throw e;
            });
        return simap;
    },
    createSimap: async(db, user_id, stockitem_id)=>{
        const query = 'insert into "SIMap" (user_id, stockitem_id) VALUES ($1, $2)';
        const values = [user_id, stockitem_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                e.name = "createSimapError";
                throw e;
            });
    },
    increaseTakecount: async(db, user_id, stockitem_id)=>{
        const query = 'update "SIMap" set take_count=take_count+1 where user_id=$1 and stockitem_id=$2';
        const values = [user_id, stockitem_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                e.name = "increaseTakecountError";
                throw e;
            });
    },
    decreaseTakecount: async(db, user_id, stockitem_id)=>{
        const query = 'update "SIMap" set take_count=take_count-1 where user_id=$1 and stockitem_id=$2';
        const values = [user_id, stockitem_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                e.name = "decreaseTakecountError";
                throw e;
            });
    },
    increaseSuccesscount: async(db, user_id, stockitem_id)=>{
        const query = 'update "SIMap" set success_count=success_count+1 where user_id=$1 and stockitem_id=$2';
        const values = [user_id, stockitem_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                e.name = "increaseSuccesscountError";
                throw e;
            });
    },
    decreaseSuccesscount: async(db, user_id, stockitem_id)=>{
        const query = 'update "SIMap" set success_count=success_count-1 where user_id=$1 and stockitem_id=$2';
        const values = [user_id, stockitem_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                e.name = "decreaseSuccesscountError";
                throw e;
            });
    },
    decreaseTwocount: async(db, user_id, stockitem_id)=>{
        const query = 'update "SIMap" set take_count=take_count-1, success_count=success_count-1 where user_id=$1 and stockitem_id=$2';
        const values = [user_id, stockitem_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                e.name = "decreaseTwocountError";
                throw e;
            });
    },
}