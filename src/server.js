const express = require('express');
const app = express();
const passport = require('../src/config/passportConfig.js');
const cors = require('cors');

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

//Router
const accountRouter = require("./routers/accountRouter.js");
const todoRouter = require("./routers/todoRouter.js");
const followRouter = require("./routers/followRouter.js");
const groupRouter = require("./routers/groupRouter.js");
const valueRouter = require("./routers/valueRouter.js");
const projectRouter = require("./routers/projectRouter.js");
const alarmRouter = require("./routers/alarmRouter.js");

app.get('/', (req, res) => {
    res.send('Hello, Express')
});

app.use("/account", accountRouter);

// acount 라우터를 제외한 모든 라우터에 JWT 인증 전역적 적용
passport.authenticate('jwt', { session: false })

app.use("/todo", todoRouter);
app.use("/follow", followRouter);
app.use("/group", groupRouter);
app.use("/value", valueRouter);
app.use("/project", projectRouter);
app.use("/alarm", alarmRouter);

// 오류 처리 미들웨어
app.use((err, req, res, next) => {
    res.status(err.status || 500);

    console.error(err.stack); // 로그 기록
    res.send('오류 발생: ' + err.message);
});

app.listen(app.get('port'), ()=>{
    console.log(app.get('port'), '번 포트에서 대기 중')
});