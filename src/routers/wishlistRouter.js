const express = require('express');
const router = express.Router();

const wishlistController = require('../controllers/wishlistController.js');

router.post('', wishlistController.newWish);
router.delete('', wishlistController.deleteWish);
router.get('', wishlistController.getWishlist);
router.post('/like', wishlistController.likeWish);
router.post('/unlike', wishlistController.unlikeWish);

module.exports = router;