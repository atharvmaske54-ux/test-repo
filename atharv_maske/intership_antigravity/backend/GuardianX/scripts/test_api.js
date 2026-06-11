const http = require('http');

function request(path, method='GET', headers={}, body=null) {
  const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path,
    method,
    headers: Object.assign({ 'Content-Type': 'application/json' }, headers)
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, body: parsed });
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
  try {
    const uniqueEmail = `testuser${Date.now()}@example.com`;
    console.log('Registering user with', uniqueEmail);
    const reg = await request('/api/auth/register','POST',{}, { name: 'Test User', email: uniqueEmail, password: 'TestPass123' });
    console.log('Register response:', reg);

    console.log('Logging in...');
    const login = await request('/api/auth/login','POST',{}, { email: uniqueEmail, password: 'TestPass123' });
    console.log('Login response:', login);

    const token = login.body && login.body.data && login.body.data.token;
    if (!token) {
      console.error('No token received, aborting.');
      process.exit(1);
    }

    console.log('Creating profile...');
    const profile = await request('/api/profile','POST',{ Authorization: 'Bearer ' + token }, {
      name: 'Test User', rollNumber: 'R12345', class: '12A', department: 'Physics', teacher: 'Mrs. Sharma', phoneNumber: '9999999999'
    });
    console.log('Profile create response:', profile);
  } catch (err) {
    console.error('Test script error:', err);
  }
})();
