const express = require('express');
const router = express.Router();

const projectController = require('../controllers/projectController.js');

router.post('', projectController.newProject);
router.put('', projectController.updateProject);
router.get('/withTodos/:project_id', projectController.readProjectWithTodos);
router.get('/all', projectController.readAllProjects);
router.put('/finish', projectController.finishProject);
router.delete('', projectController.deleteProject);

module.exports = router;