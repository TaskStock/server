const todoModel = require('../models/todoModel.js');
const repeatModel = require('../models/repeatModel.js');
const valueModel = require('../models/valueModel.js');
const { utcToZonedTime, zonedTimeToUtc } = require('date-fns-tz');
const { startOfDay, addHours, addSeconds } = require('date-fns');

module.exports = {
    newTodo: async(req, res, next) =>{
        const {content, level, project_id, repeat_day, repeat_end_date} = req.body;
        // 현재는 오늘 날짜만 todo를 생성할 수 있음
        const user_id = req.user.user_id; // passport를 통과한 유저객체에서 user_id를 받아옴
        const region = req.user.region;

        // repeat_day 검증(이 필요한가?)
        if (repeat_day.length !== 7){
            return res.status(400).json({result: "fail", message: "잘못된 repeat_day 형식입니다."});
        }else{
            for(let i=0;i<7;i++){
                if(repeat_day[i]!=='0' && repeat_day[i]!=='1'){
                    return res.status(400).json({result: "fail", message: "잘못된 repeat_day 형식입니다."});
                }
            }
        }

        let todo_id;
        try{
            todo_id = await todoModel.insertTodo(content, level, user_id, project_id);
            // 순서 관련 로직 필요
            
            if(repeat_day!=="0000000"){
                let trans_date=null;
                if(repeat_end_date!==null){
                    trans_date = zonedTimeToUtc(new Date(`${repeat_end_date} 00:00:00`), region);
                }

                await repeatModel.newRepeat(region, trans_date, repeat_day, todo_id);
            }
        }catch(error){
            next(error);
        }
        res.json({result: "success", todo_id: todo_id});
    },
    readTodo: async(req, res, next) =>{
        const date = req.query.date;
        // date : 클라이언트로부터 받은 시간 정보를 UTC 기준 timestamp로 변환
        const user_id = req.user.user_id;
        const region = req.user.region;

        const trans_start_date = zonedTimeToUtc(new Date(`${date} 00:00:00`), region);
        const end_date = new Date(trans_start_date);
        end_date.setDate(end_date.getDate() + 1);
        
        let todos;
        try{
            todos = await todoModel.readTodo(user_id, trans_start_date, end_date);

            // "end_time": "2024-01-15T15:00:00.000Z",
            //   "repeat_pattern": "0101100"
            for(let i=0;i<todos.length;i++){
                // console.log("------------");
                // console.log(todos[i].end_time);
                if(todos[i].end_time !== null){
                    // const time_without_localtimezone = 
                    const utcdate = new Date(todos[i].end_time);
                    // console.log(utcdate);
                    const trans_end_time = utcToZonedTime(utcdate, region);
                    // console.log(trans_end_time);
                    todos[i].end_time=trans_end_time.toLocaleDateString('en-CA');
                }
                // console.log(todos[i].end_time);
            }
            
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
        const {todo_id, content, level, project_id, repeat_day, repeat_end_date} = req.body;
        const user_id = req.user.user_id;
        const region = req.user.region;

        // repeat_day 검증(이 필요한가?)
        if (repeat_day.length !== 7){
            return res.status(400).json({result: "fail", message: "잘못된 repeat_day 형식입니다."});
        }else{
            for(let i=0;i<7;i++){
                if(repeat_day[i]!=='0' && repeat_day[i]!=='1'){
                    return res.status(400).json({result: "fail", message: "잘못된 repeat_day 형식입니다."});
                }
            }
        }
        
        try{
            await todoModel.updateTodo(todo_id, content, level, user_id, project_id);

            const repeat_id = await repeatModel.getRepeat(todo_id);
            if(repeat_day!=="0000000"){
                let trans_date=null;
                if(repeat_end_date!==null){
                    trans_date = zonedTimeToUtc(new Date(`${repeat_end_date} 00:00:00`), region);
                }
        
                if(repeat_id === undefined){    // todo 업데이트할때 없었던 반복설정을 새로 생성
                    await repeatModel.newRepeat(region, trans_date, repeat_day, todo_id);
                }else{  // 있던 반복설정을 수정
                    // 유저의 region은 변하지 않으므로 업데이트 대상에서 제외
                    await repeatModel.updateRepeat(trans_date, repeat_day, todo_id);
                }
            }else{  // 있던 반복설정을 삭제
                if(repeat_id !== undefined){
                    await repeatModel.deleatRepeat(todo_id);
                }
            }
        }catch(error){
            next(error);
        }
        
        res.json({result: "success"});
    },
    updateCheck: async(req, res, next) =>{
        const {todo_id, check} = req.body;
        // check : true or false
        const user_id = req.user.user_id;
        const region = req.user.region;
        
        try{
            const todo = await todoModel.updateCheck(todo_id, user_id, check);

            // 해당 todo가 정산시간을 지났는지 확인
            const nowUtc = addSeconds(new Date(), -1);   // 계산시간을 생각하여 1초뺏음
            const nowInTimeZone = utcToZonedTime(nowUtc, region);   // 지역에 맞는 시간으로 변환

            // 해당 지역의 정산시간 구하기
            const startOfToday = startOfDay(nowInTimeZone);
            const sixAMToday = addHours(startOfToday, 6);   // 정산시간(6시)
            let result;
            if (nowInTimeZone >= sixAMToday) {
                result = sixAMToday;
            } else {
                result = addHours(sixAMToday, -24);
            }
            // 결과를 UTC로 변환
            const resultUtc = zonedTimeToUtc(result, region);

            if(todo.date > resultUtc){  // 아직 정산안됐음
                let changeAmount;
                const endDate = addHours(resultUtc, 24);
                if(check===true){
                    changeAmount = todo.level * 1000;
                }else if(check===false){
                    changeAmount = todo.level * -1000;
                }
                await valueModel.updateValueBecauseTodoComplete(user_id, changeAmount, resultUtc, endDate);
            }

        }catch(error){
            next(error);
        }
        
        res.json({result: "success"});
    },
    // 유저 id와 todo id를 받아 해당 todo 삭제
    // 해당 todo와 관련된 반복설정도 삭제됨
    deleteTodo: async(req, res, next) =>{
        const {todo_id} = req.body;
        const user_id = req.user.user_id;
        
        try{
            await todoModel.deleteTodo(todo_id, user_id);
            await repeatModel.deleatRepeat(todo_id);
        }catch(error){
            next(error);
        }
        
        res.json({result: "success"});
    },
}