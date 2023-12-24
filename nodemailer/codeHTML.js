module.exports = (code) => {
    return (`
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
            <img src="cid:unique@nodemailer.com"/>
            <h1 style="color: lightcoral;">가입을 위해 인증번호를 입력해주세요!</h1>
            <h2 style="font-weight: bold;">인증번호: ${code}</h2>
        </body>
    </html>
    `);
}