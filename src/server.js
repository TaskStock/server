const express = require('express');
const app = express();

require("dotenv").config();

app.set('port', process.env.PORT || 8000);

// body 데이터를 사용하기 위한 모듈
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Router
const postRouter = require("./routers/postRouter.js");
const accountRouter = require("./routers/accountRouter.js");

app.get('/', (req, res) => {
    res.send('Hello, Express')
});

app.use("/post", postRouter);
app.use("/account", accountRouter);

// 오류 처리 미들웨어
app.use((err, req, res, next) => {
    res.status(err.status || 500);

    console.error(err.stack); // 로그 기록
    res.send('오류 발생: ' + err.message);
});

app.listen(app.get('port'), ()=>{
    console.log(app.get('port'), '번 포트에서 대기 중')
});