const wishlistModel = require('../models/wishlistModel.js');

const db = require('../config/db.js');

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

        try{
            const wishlist = await wishlistModel.getWishlist(db, offset, limit);

            return res.json({wishlist: wishlist});
        }catch(error){
            next(error);
        }
    },
}