const todoModel = require('../models/todoModel.js');

module.exports = {
    newTodo: async(req, res, next) =>{
        const todoData = req.body;
        
        try{
            await todoModel.insertTodo(todoData);
            // 순서 관련 로직 필요
        }catch(error){
            next(error);
        }
        
        res.json({result: "success"});
    },
    updateTodo: async(req, res, next) =>{
        const todoData = req.body;
        
        try{
            await todoModel.updateTodo(todoData);
        }catch(error){
            next(error);
        }
        
        res.json({result: "success"});
    },
}