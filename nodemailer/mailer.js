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
    process.env.OAUTH_REDIRECT_URL
);

//메일 형식 세팅
let htmlBody, attachedfile;
function createMailOptions(code, type) {
    switch (type) {
        case "register":
            htmlBody = registerHTML(code);
            attachedfile = [{
                filename: 'logo_background.png',
                path: __dirname + '/../public/images/logo_background.png',
                cid: 'unique@nodemailer.com'
            }]
            break;
        case "changePW":
            htmlBody = changePWHTML(code);
            attachedfile = [{
                filename: 'padang.png',
                path: __dirname + '/../public/images/padang.png',
                cid: 'unique@nodemailer.com'
            }]
            break;
        default:
            htmlBody = registerHTML(code);
            attachedfile = [{
                filename: 'padang.png',
                path: __dirname + '/../public/images/padang.png',
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
            from: `TaskStock TEAM <${process.env.OAUTH_USER}>`,
            to: email,
            subject: "[TaskStock] 이메일 인증 코드입니다.",
            html: htmlBody,
            attachments: attachedfile
        });
        console.log("Message sent: %s", info.messageId);
        return {result: true};
    } catch (error) {
        console.log(error);
        return {result: false};
    }

}

