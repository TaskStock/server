const express = require('express');
const router = express.Router();

const snsController = require('../controllers/snsController.js');

router.patch('/private', snsController.changePrivate);
router.get('/users', snsController.showRanking);
router.post('/follow', snsController.followUser);
router.delete('/unfollow', snsController.unfollowUser);
router.get('/users/search', snsController.searchUser);
router.get('/user/follow/list', snsController.showFollowList);

module.exports = router;

