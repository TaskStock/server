const express = require('express');
const router = express.Router();

const stockitemController = require('../controllers/stockitemController.js');

router.post('', stockitemController.newItem);
router.put('', stockitemController.updateItem);
router.delete('', stockitemController.deleteItem);
router.get('', stockitemController.getItems);

module.exports = router;