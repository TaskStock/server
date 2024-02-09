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
// const corsConfig = {
//     origin: [

//     ],
//     credentials: true
// };
app.use(cors());

// passport 초기화
app.use(passport.initialize());

///static 설정
app.use('/public', express.static('public'));
app.use('/uploads', express.static('uploads'));

//Router
const accountRouter = require("./routers/accountRouter.js");
const todoRouter = require("./routers/todoRouter.js");
const snsRouter = require("./routers/snsRouter.js");
const valueRouter = require("./routers/valueRouter.js");
const projectRouter = require("./routers/projectRouter.js");
const noticeRouter = require("./routers/noticeRouter.js");
const retrospectRouter = require("./routers/retrospectRouter.js");
const stockitemRouter = require("./routers/stockitemRouter.js");
const sivalueRouter = require("./routers/sivalueRouter.js");
const siuserRouter = require("./routers/siuserRouter.js");
const wishlistRouter = require("./routers/wishlistRouter.js");
const badgeRouter = require("./routers/badgeRouter.js");

// pm2 설정
let isDisableKeepAlive = false;
app.use(function(req, res, next){
    if(isDisableKeepAlive){
        res.set('Connection', 'close');
    }
    next();
});

app.get('/', (req, res) => {
    res.send('Hello, Express')
});

// 클라이언트로부터 받은 req.body를 출력하는 미들웨어
// const printReq = (req, res, next) => {
//     console.log('==header==:\n', req.headers.authorization);
//     console.log('==body==:\n', req.body);
//     next(); 
// };
// app.use(printReq);

app.use("/account", accountRouter);
app.use("/todo", passport.authenticate('jwt', { session: false }), todoRouter);
app.use("/sns", passport.authenticate('jwt', { session: false }), snsRouter);
app.use("/value", passport.authenticate('jwt', { session: false }), valueRouter);
app.use("/project", passport.authenticate('jwt', { session: false }), projectRouter);
app.use("/notice", passport.authenticate('jwt', { session: false }), noticeRouter);
app.use("/retrospect", passport.authenticate('jwt', { session: false }), retrospectRouter);
app.use("/stockitem", stockitemRouter);
app.use("/sivalue", passport.authenticate('jwt', { session: false }), sivalueRouter);
app.use("/siuser", passport.authenticate('jwt', { session: false }), siuserRouter);
app.use("/wishlist", passport.authenticate('jwt', { session: false }), wishlistRouter);
app.use("/badge", passport.authenticate('jwt', { session: false }), badgeRouter);

// 오류 처리 미들웨어
app.use(async (err, req, res, next) => {
    console.log('오류처리 미들웨어 호출')
    // MODEL - throw(err) -> CONTROLLER - next(err) -> ERROR MIDDLEWARE
    // 슬랙 알림 전송
    // err.type = 'error';
    // err.ReqBody = req.body;
    // await sendSlack(err);
    
    // 로그 기록 - 배포 버전에선 삭제
    console.error(err.stack);
    
    // 클라이언트로 오류 메시지 전송
    return res.status(500).json({
        result: "fail",
        message: "서버 내부 오류"
    })
    
});

// 스케쥴러
// if(process.env.NODE_APP_INSTANCE===undefined || process.env.NODE_APP_INSTANCE === '0'){
//     const scheduler = require("./service/scheduler.js");
//     scheduler.scheduling();
// }

app.listen(app.get('port'), ()=>{
    process.send('ready');   // pm2 설정
    console.log(app.get('port'), '번 포트에서 대기 중');
});
// pm2 설정
process.on('SIGINT', function(){
    isDisableKeepAlive = true;
    app.close(function (){
        console.log('server closed');
        process.exit(0);
    });
});