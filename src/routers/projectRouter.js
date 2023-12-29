const express = require('express');
const router = express.Router();

const projectController = require('../controllers/projectController.js');

router.post('/new', projectController.newProject);

module.exports = router;