const express = require('express');
const app = express();
const passport = require('../src/config/passportConfig.js');
const cors = require('cors');
const { sendSlack } = require('./service/noticeService.js');

require("dotenv").config();

app.set('port', process.env.PORT || 8000);

// body 데이터를 사용하기 위한 모듈
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//cors 설정
const corsConfig = {
    origin: [
        'http://localhost:8000', // Node.js 서버
        'http://localhost:8081', // Merto Bundler 서버
        'http://localhost:19000', // Expo 서버
        'http://localhost:19001', // Expo Metro Bundler 서버
        'http://localhost:19002', // Expo 개발자 도구
        'http://192.168.0.5:8081' // Merto Bundler 서버
    ],
    credentials: true
};
app.use(cors(corsConfig));

// passport 초기화
app.use(passport.initialize());

///static 설정
app.use('/public', express.static('public'));
app.use('/uploads', express.static('uploads'));

//Router
const accountRouter = require("./routers/accountRouter.js");
const todoRouter = require("./routers/todoRouter.js");
const snsRouter = require("./routers/snsRouter.js");
const groupRouter = require("./routers/groupRouter.js");
const valueRouter = require("./routers/valueRouter.js");
const projectRouter = require("./routers/projectRouter.js");
const noticeRouter = require("./routers/noticeRouter.js");
const retrospectRouter = require("./routers/retrospectRouter.js");
const stockitemRouter = require("./routers/stockitemRouter.js");
const sivalueRouter = require("./routers/sivalueRouter.js");

app.get('/', (req, res) => {
    res.send('Hello, Express')
});

// 클라이언트로부터 받은 req.body를 출력하는 미들웨어
const printReq = (req, res, next) => {
    console.log('==header==:\n', req.headers.authorization);
    console.log('==body==:\n', req.body);
    next(); 
};
app.use(printReq);

// 트랜잭션 처리 미들웨어
const db = require('./config/db.js');

async function transaction(req, res, next){
    try{
        const connection = await db.connect();
        await connection.query('BEGIN');
        req.dbClient = connection;

        next();
    } catch(error){
        await connection.query('ROLLBACK');
        connection.release();
        next(error);
    }
}

app.use("/account", accountRouter);
app.use("/todo", passport.authenticate('jwt', { session: false }), transaction, todoRouter);
app.use("/sns", passport.authenticate('jwt', { session: false }), snsRouter);
app.use("/group", passport.authenticate('jwt', { session: false }), groupRouter);
app.use("/value", passport.authenticate('jwt', { session: false }), transaction, valueRouter);
app.use("/project", passport.authenticate('jwt', { session: false }), projectRouter);
app.use("/notice", passport.authenticate('jwt', { session: false }), noticeRouter);
app.use("/retrospect", passport.authenticate('jwt', { session: false }), retrospectRouter);
app.use("/stockitem", stockitemRouter);
app.use("/sivalue", passport.authenticate('jwt', { session: false }), sivalueRouter);

// 오류 처리 미들웨어
app.use(async (err, req, res, next) => {
    console.log('오류처리 미들웨어 호출')
    // MODEL - throw(err) -> CONTROLLER - next(err) -> ERROR MIDDLEWARE
    // 슬랙 알림 - 리팩토링 후 배포 버전에서만 사용
    // err.type = 'error';
    // await sendSlack(err);
    
    // 로그 기록 - 배포 버전에선 삭제
    console.error(err.stack);    
    
    res.status(err.status || 500);

    // 클라이언트에 전송 - 리팩토링 전에만 사용
    res.send(err.message); 

    // 클라이언트에 전송 - 리팩토링 후 배포 버전에서만 사용
    // res.json({
    //     result: "error",
    //     message: err.message
    // });
});

// 스케쥴러
// const scheduler = require("./service/scheduler.js");
// scheduler.scheduling();

app.listen(app.get('port'), ()=>{
    console.log(app.get('port'), '번 포트에서 대기 중')
});