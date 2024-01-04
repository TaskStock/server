const express = require('express');
const router = express.Router();

const todoController = require('../controllers/todoController.js');

router.post('/new', todoController.newTodo);
router.get('/read', todoController.readTodo);
router.post('/simpleupdate', todoController.updateContentAndProject);
router.post('/update', todoController.updateTodo);
router.delete('/delete', todoController.deleteTodo);

module.exports = router;