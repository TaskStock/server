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
                    trans_date = new Date(`${repeat_end_date} 06:00:00`);
                    // repeat_end_date : 2024-01-16 -> trans_date : 2024-01-16T21:00:00.000Z (로컬이 Asia/Seoul 인 경우)
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

        const trans_start_date = new Date(`${date} 00:00:00`);
        const end_date = addHours(trans_start_date, 24);
        
        let todos;
        try{
            todos = await todoModel.readTodo(user_id, trans_start_date, end_date);

            // "end_time": "2024-01-15T15:00:00.000Z",
            // "repeat_pattern": "0101100"
            for(let i=0;i<todos.length;i++){
                if(todos[i].end_time !== null){
                    const utcdate = new Date(todos[i].end_time);    // 이미 로컬 시간대가 적용됨?
                    const trans_end_time = utcToZonedTime(utcdate, region); // 이 코드가 필요한지 모르겠음
                    todos[i].end_time=trans_end_time.toLocaleDateString('en-CA');
                    // toLocaleDateString 가 로컬시간대의 날짜를 뽑아내는데 배포서버에도 제대로 작동할지 모르겠음
                }

                // 프론트 요구로 null이 아닌 "0000000" 으로 반환
                if(todos[i].repeat_pattern === null){
                    todos[i].repeat_pattern = "0000000";
                }

                // 프론트 요구로 임시로 동일한 내용의 추가 필드 생성
                todos[i].repeat_end_date = todos[i].end_time;
                todos[i].repeat_day = todos[i].repeat_pattern;
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
                    trans_date = new Date(`${repeat_end_date} 06:00:00`);
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
            const nowUtc = addSeconds(new Date(), 1);   // 계산시간을 생각하여 1초더함
            const nowInTimeZone = utcToZonedTime(nowUtc, region);   // 이미 로컬 시간대에 대한 정보를 포함한 utc임. 즉, 로컬 시간대로 안변함 - 이 로직이 필요한가?

            // 해당 지역의 정산시간 구하기
            const startOfToday = startOfDay(nowInTimeZone); // utc이지만 로컬 시간대에 맞는 시작일을 제대로 구하고 있음
            const sixAMToday = addHours(startOfToday, 6);   // 정산시간(6시)
            let result;
            if (nowInTimeZone >= sixAMToday) {
                result = sixAMToday;
            } else {
                result = addHours(sixAMToday, -24);
            }
            // 결과를 UTC로 변환 - 이미 UTC인데? 필요한가?
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
    test: async(req, res, next) =>{
        const {todo_id, date} = req.body;
        const region = req.user.region;
        
        try{
            const t_date = new Date(date);
            console.log(t_date);
            const t = await todoModel.test(todo_id, t_date);
            // const tmp = t.toLocaleDateString('en-CA');

            console.log("!!!!");
            const tmp = new Date("2024-01-06");
            console.log(tmp);
            const trans_date = zonedTimeToUtc(tmp, region);
            console.log(trans_date);

            return res.json({test: tmp});
        }catch(error){
            next(error);
        }
        
        res.json({result: "success"});
    },
}