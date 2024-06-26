const express = require('express');
const router = express.Router();
const {uploader, errorHandler} = require('../config/multerConfig.js');

const snsController = require('../controllers/snsController.js');

router.patch('/private', snsController.changePrivate);
// router.get('/users', snsController.showRanking);
router.post('/follow', snsController.followUser);
router.delete('/unfollow', snsController.unfollowUser);
router.get('/users/search', snsController.searchUser);
router.get('/list', snsController.showFollowList);
router.patch('/edit/info', snsController.editUserInfo);
router.patch('/edit/image', uploader.single('image'), errorHandler, snsController.editUserImage);
router.patch('/pending', snsController.acceptPending);
router.patch('/edit/default', snsController.changeDefaultImage);
router.delete('/follow', snsController.cancelFollow);
router.get('/users/:user_id', snsController.userDetail);
router.get('/:target_id/list', snsController.showTargetFollowList);

module.exports = router;

