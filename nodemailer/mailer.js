const mailer = require('nodemailer');
const codeHTML = require('./codeHTML.js');
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

oauth2Client.setCredentials({
    refresh_token: process.env.OAUTH_REFRESH_TOKEN
});
const accessToken = oauth2Client.getAccessToken();

module.exports = async (email, code) => {
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

    const htmlBody = codeHTML(code);
    try {
        const info = await transporter.sendMail({
            from: process.env.OAUTH_TS_MAIL,
            to: email,
            subject: "[TaskStock] 이메일 인증 코드입니다.",
            html: htmlBody,
            attachments: [{
                filename: 'padang.png',
                path: __dirname + '/../public/images/padang.png',
                cid: 'unique@nodemailer.com'
            }]
        });
        console.log("Message sent: %s", info.messageId);
        return {result: true};
    } catch (error) {
        console.log(error);
        return {result: false};
    }
}

