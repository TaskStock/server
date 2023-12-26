const todoModel = require('../models/todoModel.js');

module.exports = {
    newTodo: async(req, res, next) =>{
        const {title, content, level, user_id, project_id} = req.body;
        // 현재는 오늘 날짜만 todo를 생성할 수 있음
        
        try{
            await todoModel.insertTodo(title, content, level, user_id, project_id);
            // 순서 관련 로직 필요
        }catch(error){
            next(error);
        }
        
        res.json({result: "success"});
    },
    // 유저아이디와 날짜를 받아서 해당하는 todo들을 반환
    // 날짜 받을 때 지역정보?도 같이 받아야 utc 기준으로 계산 가능
    readTodo: async(req, res, next) =>{
        const {user_id, date} = req.body;
        // date : 클라이언트로부터 받은 시간 정보를 UTC 기준으로 변환한 후 년,월,일까지 저장하도록 처리할것 ex. 2023-12-24
        
        let todos;
        try{
            todos = await todoModel.readTodo(user_id, date);
        }catch(error){
            next(error);
        }
        
        res.json({todos: todos});
    },
    updateTodo: async(req, res, next) =>{
        const {todo_id, title, content, level, user_id, project_id} = req.body;
        
        try{
            await todoModel.updateTodo(todo_id, title, content, level, user_id, project_id);
        }catch(error){
            next(error);
        }
        
        res.json({result: "success"});
    },
    // 유저 id와 todo id를 받아 해당 todo 삭제
    deleteTodo: async(req, res, next) =>{
        const {todo_id, user_id} = req.body;
        
        try{
            await todoModel.deleteTodo(todo_id, user_id);
        }catch(error){
            next(error);
        }
        
        res.json({result: "success"});
    },
}