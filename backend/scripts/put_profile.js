const fetch = global.fetch || require('node-fetch');
const token = process.env.TEST_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTY5LCJlbWFpbCI6InZlcmlmeTE3ODQ3ODgyMjI1MTdAZXhhbXBsZS5jb20iLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTc4NDgwNDQ4MSwiZXhwIjoxNzg1NDA5MjgxfQ.Wr0xJBK1ETo_jHuO4LOc3iiVPJXSh6RH6RDroojlaFU';

(async () => {
  const marker = 'DBDirect_' + Date.now().toString().slice(-6);
  try {
    const res = await fetch('http://localhost:5000/api/students/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: marker, email: 'verify1784788222517@example.com', reg_no: 'UoK/CS/222517', course: 'Computer Science' })
    });
    const text = await res.text();
    console.log({ status: res.status, ok: res.ok, body: text, marker });
  } catch (err) {
    console.error('Request failed', err);
    process.exit(1);
  }
})();
