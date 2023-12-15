const express = require('express');
const app = express();

require("dotenv").config();

app.set('port', process.env.PORT || 8000);

//Router
const postRouter = require("./routers/postRouter.js");

app.get('/', (req, res) => {
    res.send('Hello, Express')
});

app.use("/post", postRouter);

app.listen(app.get('port'), ()=>{
    console.log(app.get('port'), '번 포트에서 대기 중')
});