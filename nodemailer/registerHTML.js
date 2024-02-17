module.exports = (code_1, code_2, code_3, code_4, code_5, code_6) => {
    return (`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body style="font-size: 62.5%; width: 100%; margin: auto; color: #333">
    <table class="container">
      <tr style="background-color: #333">
        <td>
          <div class="logo" style="padding: 5rem; width: 250px; margin: 0 auto">
          <img style="width: 100%" src="cid:unique@nodemailer.com"/>
          </div>
        </td>
      </tr>
      <tr style="text-align: center">
        <td>
          <table style="padding: 50px 40px; margin: auto">
            <tr>
              <td
                style="
                  font-size: 1.6rem;
                  font-weight: 600;
                  text-align: center;
                  word-break: keep-all;
                  line-height: 1.2;
                  color: black;
                "
              >
                안녕하세요!
              </td>
            </tr>
            <tr>
              <td
                style="
                  font-size: 1.6rem;
                  font-weight: 600;
                  text-align: center;
                  word-break: keep-all;
                  line-height: 1.2;
                  color: black;
                "
              >
                TASKSTOCK 가입을 위한 인증번호를 보내드립니다.
              </td>
            </tr>
            <tr>
              <td
                style="
                  font-size: 1.2rem;
                  padding-top: 10px;
                  text-align: center;
                  word-break: keep-all;
                  line-height: 1.2;
                  color: black;
                "
              >
                아래 인증번호를 앱 화면에서 입력하여 이메일 주소 인증을 완료해
                주세요.
              </td>
            </tr>
          </table>
          <table
            style="
              margin: auto;
              font-size: 2rem;
              border-collapse: separate;
              border-spacing: 10px;
              padding-bottom: 40px;
            "
          >
            <tr style="text-align: center">
              <td
                style="
                  padding: 10px;
                  background-color: #EDEEF0;
                  border-radius: 5px;
                  width: 20px;
                  color: black;
                "
              >
                ${code_1}
              </td>
              <td
                style="
                  padding: 10px;
                  background-color: #EDEEF0;
                  border-radius: 5px;
                  width: 20px;
                  color: black;
                "
              >
                ${code_2}
              </td>
              <td
                style="
                  padding: 10px;
                  background-color: #EDEEF0;
                  border-radius: 5px;
                  width: 20px;
                  color: black;
                "
              >
                ${code_3}
              </td>
              <td
                style="
                  padding: 10px;
                  background-color: #EDEEF0;
                  border-radius: 5px;
                  width: 20px;
                  color: black;
                "
              >
                ${code_4}
              </td>
              <td
                style="
                  padding: 10px;
                  background-color: #EDEEF0;
                  border-radius: 5px;
                  width: 20px;
                  color: black;
                "
              >
                ${code_5}
              </td>
              <td
                style="
                  padding: 10px;
                  background-color: #EDEEF0;
                  border-radius: 5px;
                  width: 20px;
                  color: black;
                "
              >
                ${code_6}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 50px; background-color: #333; color: white">
          <table>
            <tr>
              <td style="font-size: 1rem; color: white;">Team TASKSTOCK</td>
            </tr>
            <tr>
              <td style="font-size: 1rem; color: white;">Email: taskstock.team@gmail.com</td>
            </tr>
            <tr>
              <td style="font-size: 1rem; color: white;">Instagram: @taskstock.official</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `);
}