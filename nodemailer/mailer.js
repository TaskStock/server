const mailer = require('nodemailer');
const registerHTML = require('./registerHTML.js');
const changePWHTML = require('./changePWHTML.js');
const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

const OAuth2 = google.auth.OAuth2;

//nodemailer
const oauth2Client = new OAuth2(
    process.env.OAUTH_CLIENT_ID,
    process.env.OAUTH_CLIENT_SECRET,
);

//메일 형식 세팅
let htmlBody, attachedfile;
function createMailOptions(_code, type) {
    let code_1 = _code.toString().charAt(0)
    let code_2 = _code.toString().charAt(1)
    let code_3 = _code.toString().charAt(2)
    let code_4 = _code.toString().charAt(3)
    let code_5 = _code.toString().charAt(4)
    let code_6 = _code.toString().charAt(5)

    switch (type) {
        case "register":
            htmlBody = registerHTML(code_1, code_2, code_3, code_4, code_5, code_6);
            attachedfile = [{
                filename: 'full_logo_dark.png',
                path: __dirname + '/../public/images/full_logo_dark.png',
                cid: 'unique@nodemailer.com'
            }]
            break;
        case "changePW":
            htmlBody = changePWHTML(code_1, code_2, code_3, code_4, code_5, code_6);
            attachedfile = [{
                filename: 'full_logo_dark.png',
                path: __dirname + '/../public/images/full_logo_dark.png',
                cid: 'unique@nodemailer.com'
            }]
            break;
        default:
            htmlBody = registerHTML(code_1, code_2, code_3, code_4, code_5, code_6);
            attachedfile = [{
                filename: 'padang.png',
                path: __dirname + '/../public/images/full_logo_dark.png',
                cid: 'unique@nodemailer.com'
            }]
            break;
    }
}

oauth2Client.setCredentials({
    refresh_token: process.env.OAUTH_REFRESH_TOKEN
});
const accessToken = oauth2Client.getAccessToken();

module.exports = async (email, code, type) => {
    const transporter = mailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            type: 'OAuth2',
            user: process.env.OAUTH_USER,
            clientId: process.env.OAUTH_CLIENT_ID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            refreshToken: process.env.OAUTH_REFRESH_TOKEN,
            accessToken: accessToken
        },
    });

    let _code = code
    let _type = type

    createMailOptions(_code, _type)

    try {
        const info = await transporter.sendMail({
            from: `Team TASKSTOCK <${process.env.OAUTH_USER}>`,
            to: email,
            subject: "[TASKSTOCK] 이메일 인증 코드입니다.",
            html: htmlBody,
            attachments: attachedfile
        });
        return {result: true};
    } catch (error) {
        throw error;
    }
}

