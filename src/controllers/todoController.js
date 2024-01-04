const todoModel = require('../models/todoModel.js');
const { zonedTimeToUtc } = require('date-fns-tz');

module.exports = {
    newTodo: async(req, res, next) =>{
        const {content, level, project_id} = req.body;
        // 현재는 오늘 날짜만 todo를 생성할 수 있음
        
        const user_id = req.user.user_id; // passport를 통과한 유저객체에서 user_id를 받아옴
        try{
            await todoModel.insertTodo(content, level, user_id, project_id);
            // 순서 관련 로직 필요
        }catch(error){
            next(error);
        }
        res.json({result: "success"});
    },
    // 유저아이디와 날짜를 받아서 해당하는 todo들을 반환
    // 날짜 받을 때 지역정보?도 같이 받아야 utc 기준으로 계산 가능
    readTodo: async(req, res, next) =>{
        const {date} = req.body;
        // date : 클라이언트로부터 받은 시간 정보를 UTC 기준으로 변환한 후 년,월,일까지 저장하도록 처리할것 ex. 2023-12-24
        const user_id = req.user.user_id;
        const region = req.user.region;

        const trans_start_date = zonedTimeToUtc(new Date(`${date}T00:00:00`), region);
        const end_date = new Date(trans_start_date);
        end_date.setDate(end_date.getDate() + 1);
        
        let todos;
        try{
            todos = await todoModel.readTodo(user_id, trans_start_date, end_date);
        }catch(error){
            next(error);
        }
        
        res.json({todos: todos});
    },
    updateContentAndProject: async(req, res, next) =>{
        const {todo_id, content, project_id} = req.body;
        const user_id = req.user.user_id;
        
        try{
            await todoModel.updateContentAndProject(todo_id, content, user_id, project_id);
        }catch(error){
            next(error);
        }
        
        res.json({result: "success"});
    },
    updateTodo: async(req, res, next) =>{
        const {todo_id, content, level, project_id} = req.body;
        const user_id = req.user.user_id;
        
        try{
            await todoModel.updateTodo(todo_id, content, level, user_id, project_id);
        }catch(error){
            next(error);
        }
        
        res.json({result: "success"});
    },
    // 유저 id와 todo id를 받아 해당 todo 삭제
    deleteTodo: async(req, res, next) =>{
        const {todo_id} = req.body;
        const user_id = req.user.user_id;
        
        try{
            await todoModel.deleteTodo(todo_id, user_id);
        }catch(error){
            next(error);
        }
        
        res.json({result: "success"});
    },
}