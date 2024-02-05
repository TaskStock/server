module.exports = {
    insertWishlist: async(db, name, user_id)=>{
        const query = 'insert into "WishList" (name, user_id) VALUES ($1, $2)';
        const values = [name, user_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    deleteWishlist: async(db, wishlist_id, user_id)=>{
        const query = 'delete from "WishList" where wishlist_id=$1 and user_id=$2';
        const values = [wishlist_id, user_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
    },
    getWishlist: async(db)=>{
        const query = 'select * from "WishList"';
        const values = [];

        const wishlist = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                console.error(e.stack);

                throw e;
            });
        return wishlist;
    },
}