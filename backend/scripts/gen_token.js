const crypto = require('crypto');
const secret = process.env.JWT_SECRET || 'hexagon6-129';
const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const payloadObj = {
  id: 569,
  email: 'verify1784788222517@example.com',
  role: 'student',
  iat: now,
  exp: now + 7 * 24 * 3600
};
const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
const data = `${header}.${payload}`;
const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
console.log(`${data}.${sig}`);
