const express = require('express');
const router = express.Router();

const projectController = require('../controllers/projectController.js');

router.post('/new', projectController.newProject);
router.put('/update', projectController.updateProject);
router.put('/retrospect', projectController.writeRetrospect);
router.get('/readProject', projectController.readProjectWithTodos);
router.get('/readAllProjects', projectController.readAllProjects);

module.exports = router;