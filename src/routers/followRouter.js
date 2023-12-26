const express = require('express');
const router = express.Router();

const followController = require('../controllers/followController.js');

router.post('/follow', followController.follow);
router.post('/unfollow', followController.unfollow);
router.get('/profile', followController.getProfile);

module.exports = router;