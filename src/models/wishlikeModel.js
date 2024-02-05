module.exports = {
    like: async(db, user_id, wishlist_id)=>{
        const query = 'insert into "WishLike" (user_id, wishlist_id) VALUES ($1, $2)';
        const values = [user_id, wishlist_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    unlike: async(db, user_id, wishlist_id)=>{
        const query = 'delete from "WishLike" where user_id=$1 and wishlist_id=$2';
        const values = [user_id, wishlist_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    getLike: async(db, user_id, wishlist_id)=>{
        const query = 'select * from "WishLike" where user_id=$1 and wishlist_id=$2';
        const values = [user_id, wishlist_id];

        const wishlike = await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return wishlike;
    },
}