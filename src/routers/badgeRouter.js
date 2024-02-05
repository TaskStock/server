const express = require('express');
const router = express.Router();

const badgeController = require('../controllers/badgeController');

router.post('', badgeController.giveBadge);
router.get('/:user_id', badgeController.getBadges);

module.exports = router;