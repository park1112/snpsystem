export default function Coupang() {
  const https = require('https');
  const crypto = require('crypto');

  const datetime = new Date().toISOString().substr(2, 17).replace(/:/gi, '').replace(/-/gi, '') + 'Z';
  const method = 'GET';
  const path = '/v2/providers/openapi/apis/api/v4/vendors/A00461584/ordersheets';

  // const path = '/v2/providers/openapi/apis/api/v4/vendors/A00461584/returnRequests';
  // 취소 반품
  // const query = 'createdAtFrom=2022-03-21&createdAtTo=2022-03-22&status=UC';

  const query = 'createdAtFrom=2022-03-21&createdAtTo=2022-03-22&maxPerPage=2&status=INSTRUCT';

  const message = datetime + method + path + query;
  const urlpath = path + '?' + query;

  //input your accessKey
  const ACCESS_KEY = process.env.COOPANG_ACCESS_KEY;
  //input your secretKey
  const SECRET_KEY = process.env.COOPANG_SECRET_KEY;
  const algorithm = 'sha256';

  const signature = crypto.createHmac(algorithm, SECRET_KEY).update(message).digest('hex');

  const authorization =
    'CEA algorithm=HmacSHA256, access-key=' + ACCESS_KEY + ', signed-date=' + datetime + ', signature=' + signature;
  console.log(authorization);

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
  const log = https.request(options);

  const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);
    console.log(`reason: ${res.statusMessage}`);

    res
      .on('data', (chunk) => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();
        const json = JSON.parse(body);
        console.log('끝!!');
        console.log(JSON.stringify(json, null, 10));
      });
  });
  console.log('이거뭐지?');

  req.on('error', (error) => {
    console.error(error);
  });

  console.log('끝!!!ㅋ');
  req.end();
  return <>zzz</>;
}
