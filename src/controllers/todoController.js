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
    // 유저아이디와 날짜를 받아서 해당하는 todo들을 반환
    // 날짜 받을 때 지역정보?도 같이 받아야 utc 기준으로 계산 가능
    readTodo: async(req, res, next) =>{
        const todoData = req.body;
        
        let todos;
        try{
            todos = await todoModel.readTodo(todoData);
        }catch(error){
            next(error);
        }
        
        res.json({todos: todos});
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
    // 유저 id와 todo id를 받아 해당 todo 삭제
    deleteTodo: async(req, res, next) =>{
        const todoData = req.body;
        
        try{
            await todoModel.deleteTodo(todoData);
        }catch(error){
            next(error);
        }
        
        res.json({result: "success"});
    },
}