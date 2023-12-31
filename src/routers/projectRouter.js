const express = require('express');
const router = express.Router();

const projectController = require('../controllers/projectController.js');

router.post('', projectController.newProject);
router.put('', projectController.updateProject);
router.put('/retrospect', projectController.writeRetrospect);
router.get('/withTodos/:project_id', projectController.readProjectWithTodos);
router.get('/all', projectController.readAllProjects);

module.exports = router;