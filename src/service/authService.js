const jwt = require('jsonwebtoken');

module.exports = {
    // accessToken 생성
    generateAccessToken: (userData) => {
        const expiresIn = "1h";
        const user_id = userData.user_id;
        const device_id = userData.device_id;
        const accessToken = jwt.sign({user_id, device_id}, process.env.ACCESS_TOKEN_SECRET, { expiresIn });
        const accessExp = jwt.decode(accessToken).exp;

        return [accessToken, accessExp];
    },
    // refreshToken 생성
    generateRefreshToken: (userData) => {
        const expiresIn = "2y";
        const user_id = userData.user_id;
        const device_id = userData.device_id;
        const refreshToken = jwt.sign({user_id, device_id}, process.env.REFRESH_TOKEN_SECRET, { expiresIn });
        const refreshExp = jwt.decode(refreshToken).exp;
        
        return [refreshToken, refreshExp];
    },
    // 무작위 인증 코드 생성
    generateAuthCode: () => {
        let authCode = '';
        for (let i = 0; i < 6; i++) {
            authCode += Math.floor(Math.random() * 10);
        } //여섯자리 숫자로 이루어진 인증코드 생성(string)
        return authCode;
    }
}


