module.exports = {
    insertWishlist: async(db, name, user_id)=>{
        const query = 'insert into "WishList" (name, user_id) VALUES ($1, $2)';
        const values = [name, user_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                e.name = "insertWishlistError";

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
                e.name = "deleteWishlistError";

                throw e;
            });
    },
    getWishlist: async(db, offset, limit, filter, user_id)=>{
        const query = `
        select a.*, b.user_id is not null as is_liked 
        from "WishList" a
            left join 
                (select * from "WishLike" where user_id=$3) b 
                on a.wishlist_id=b.wishlist_id 
        order by ${filter} 
        limit $1 offset $2
        `;
        const values = [limit, offset, user_id];

        const wishlist = await db.query(query, values)
            .then(res => {
                // console.log(res.rows);
                return res.rows;
            })
            .catch(e => {
                e.name = "getWishlistError";

                throw e;
            });
        return wishlist;
    },
    increaseLike: async(db, wishlist_id)=>{
        const query = 'update "WishList" set like_count=like_count+1 where wishlist_id=$1';
        const values = [wishlist_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                e.name = "increaseLikeError";

                throw e;
            });
    },
    decreaseLike: async(db, wishlist_id)=>{
        const query = 'update "WishList" set like_count=like_count-1 where wishlist_id=$1';
        const values = [wishlist_id];

        await db.query(query, values)
            .then(res => {
                // console.log(res.rows[0]);
            })
            .catch(e => {
                e.name = "decreaseLikeError";

                throw e;
            });
    },
}