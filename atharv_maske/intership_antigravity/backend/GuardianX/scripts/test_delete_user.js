const http = require('http');

function request(path, method='GET', headers={}, body=null) {
  const opts = {
    hostname: '127.0.0.1',
    port: 5000,
    path,
    method,
    headers: Object.assign({ 'Content-Type': 'application/json' }, headers)
  };

  return new Promise((resolve, reject) => {
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
        } catch (err) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  const email = `delete.test.${Date.now()}@example.com`;
  console.log('Registering', email);
  const register = await request('/api/auth/register', 'POST', {}, { name: 'Delete Test', email, password: 'TestPass123' });
  console.log('Register:', register);

  if (register.status !== 201) return;

  const login = await request('/api/auth/login', 'POST', {}, { email, password: 'TestPass123' });
  console.log('Login:', login);
  if (login.status !== 200 || !login.body?.data?.token) return;
  const token = login.body.data.token;

  const deleteRes = await request('/api/auth/delete', 'DELETE', { Authorization: `Bearer ${token}` });
  console.log('Delete:', deleteRes);

  const getProfile = await request('/api/profile', 'GET', { Authorization: `Bearer ${token}` });
  console.log('Get profile after delete:', getProfile);
})();
