import request from 'supertest';
import apppkg from 'child_process';

// We'll spin up the server process for tests (simplified)
test('login and create participant', async ()=>{
  const base = 'http://localhost:3000';
  // login admin
  const loginRes = await fetch(base + '/auth/login', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ email:'admin@ialo.org', password:'admin123' })
  });
  expect(loginRes.status).toBe(200);
  const { token } = await loginRes.json();

  // create participant
  const pRes = await fetch(base + '/participants', {
    method:'POST',
    headers:{'Content-Type':'application/json', 'Authorization': 'Bearer '+token},
    body: JSON.stringify({ name:'Fulano de Tal', contact:'(85) 99999-9999' })
  });
  expect([200,201]).toContain(pRes.status);
});
