export default (req, res) => {
  const https = require('https');
  const crypto = require('crypto');

  const datetime = new Date().toISOString().substr(2, 17).replace(/:/gi, '').replace(/-/gi, '') + 'Z';
  const method = 'GET';
  const path =
    '/v2/providers/seller_api/apis/api/v1/marketplace/meta/category-related-metas/display-category-codes/77723';
  const query = '';

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

  const reqs = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);
    console.log(`reason: ${res.statusMessage}`);

    res
      .on('data', (chunk) => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();
        const json = JSON.parse(body);
        console.log(JSON.stringify(json, null, 2));
        console.log('json!!!');
        console.log(json);
      });
  });

  reqs.on('error', (error) => {
    console.error(error);
  });

  reqs.end();
  res.json(reqs);
};
