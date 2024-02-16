const wishlistModel = require('../models/wishlistModel.js');
const wishlikeModel = require('../models/wishlikeModel.js');

const db = require('../config/db.js');

function filtering(filter){
    if(filter === undefined){   // default : 좋아요순
        filter = "like_count desc";
    }else if(filter === "like"){    // 좋아요순
        filter = "like_count desc";
    }else if(filter === "latest"){  // 최신순
        filter = "created_date desc";
    }else{
        filter = "like_count desc";
    }
    return filter;
}

module.exports = {
    newWish: async(req, res, next) =>{
        const {name} = req.body;
        const user_id = req.user.user_id;
        
        try{
            await wishlistModel.insertWishlist(db, name, user_id);

			return res.json({result: "success"});
        }catch(error){
            next(error);
        }
    },
    deleteWish: async(req, res, next) =>{
        const {wishlist_id} = req.body;
        const user_id = req.user.user_id;
        
        try{
            await wishlistModel.deleteWishlist(db, wishlist_id, user_id);

			return res.json({result: "success"});
        }catch(error){
            next(error);
        }
    },
    getWishlist: async(req, res, next) =>{
        const offset = req.query.offset;
        const limit = req.query.limit;
        let filter = req.query.filter;

        const user_id = req.user.user_id;

        try{
            filter = filtering(filter);

            const wishlist = await wishlistModel.getWishlist(db, offset, limit, filter, user_id);

            return res.json({wishlist: wishlist});
        }catch(error){
            next(error);
        }
    },
    likeToggle: async(req, res, next) =>{
        const {wishlist_id} = req.body;
        const user_id = req.user.user_id;

        const cn = await db.connect();
        try{
            await cn.query('BEGIN');

            isliked = await wishlikeModel.getLike(cn, user_id, wishlist_id);
            if(isliked.length>0){
                await wishlikeModel.unlike(cn, user_id, wishlist_id);
                await wishlistModel.decreaseLike(cn, wishlist_id);
            }else if(isliked.length===0){
                await wishlikeModel.like(cn, user_id, wishlist_id);
                await wishlistModel.increaseLike(cn, wishlist_id);
            }

            await cn.query('COMMIT');
            return res.json({result: "success"});
        }catch(error){
            await cn.query('ROLLBACK');
            next(error);
        }finally{
            cn.release();
        }
    },
}