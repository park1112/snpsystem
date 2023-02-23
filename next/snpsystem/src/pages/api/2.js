import { reject } from 'lodash';
import { resolve } from 'path';

export default (요청, 응답) => {
  return new Promise(
    (resolve,
    (reject) => {
      응답.statusCode = 200;

      const https = require('https');
      const crypto = require('crypto');

      const datetime = new Date().toISOString().substr(2, 17).replace(/:/gi, '').replace(/-/gi, '') + 'Z';
      const method = 'GET';
      const path = '/v2/providers/openapi/apis/api/v4/vendors/A00643254/ordersheets';

      // const path = '/v2/providers/openapi/apis/api/v4/vendors/A00461584/returnRequests';
      // 취소 반품
      // const query = 'createdAtFrom=2022-03-21&createdAtTo=2022-03-22&status=UC';

      // 현재시간 추가 !

      let today = new Date(); // today 객체에 Date()의 결과를 넣어줬다
      let time = {
        year: today.getFullYear(), //현재 년도
        month: today.getMonth() + 1, // 현재 월
        date: today.getDate(), // 현재 날짜
        hours: today.getHours(), //현재 시간
        minutes: today.getMinutes(), //현재 분
      };
      const newDataTime = `${time.year}-0${time.month}-${time.date}`;
      const endDataTime = `${time.year}-0${time.month}-${time.date - 5}`;
      console.log(endDataTime);
      let nextToken = 요청.query.nextToken;

      const query = `createdAtFrom=${endDataTime}&createdAtTo=${newDataTime}&nextToken=${nextToken}&maxPerPage=50&status=ACCEPT`;

      const message = datetime + method + path + query;
      const urlpath = path + '?' + query;

      //input your accessKey
      const ACCESS_KEY = process.env.SNP_COIPANG_ACCESS_KEY;
      //input your secretKey
      const SECRET_KEY = process.env.SNP_COOPANG_SECRET_KEY;
      const algorithm = 'sha256';

      const signature = crypto.createHmac(algorithm, SECRET_KEY).update(message).digest('hex');

      const authorization =
        'CEA algorithm=HmacSHA256, access-key=' + ACCESS_KEY + ', signed-date=' + datetime + ', signature=' + signature;

      const options = {
        hostname: 'api-gateway.coupang.com',
        port: 443,
        path: urlpath,
        method: method,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          Authorization: authorization,
          'X-EXTENDED-TIMEOUT': 90000,
        },
      };

      let body = [];
      let newNextToken = 1;

      const req = https.request(options, (res) => {
        console.log(`statusCode: ${res.statusCode}`);
        console.log(`reason: ${res.statusMessage}`);

        res
          .on('data', (chunk) => {
            body.push(chunk);
          })
          .on('end', () => {
            body = Buffer.concat(body).toString();
            let json = JSON.parse(body);
            res.body;
            응답.json(JSON.stringify(json, null, 2));
          });
      });

      req.on('error', (error) => {
        console.error(error);
      });

      req.end();
      resolve();
    })
  );
};
