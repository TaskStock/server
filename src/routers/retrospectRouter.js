const express = require('express');
const router = express.Router();

const retrospectController = require('../controllers/retrospectController.js');

router.post('', retrospectController.newRetrospect);
router.put('', retrospectController.updateRetrospect);
router.delete('', retrospectController.deleteRetrospect);

module.exports = router;