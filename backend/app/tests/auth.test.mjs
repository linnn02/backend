import request from 'supertest';
import app from '../src/index.js';

describe('Auth routes', () => {
  it('should deny invalid credentials', async () => {
    const res = await request(app).post('/auth/login').send({ username: 'bad', password: 'bad' });
    expect(res.statusCode).toBe(401);
  });

  it('should accept valid admin credentials and return token', async () => {
    const res = await request(app).post('/auth/login').send({ username: 'admin', password: 'admin' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});

describe('Collector route protection', () => {
  it('should block unauthenticated POST requests', async () => {
    const res = await request(app).post('/collect').send({ query: 'quantum' });
    expect(res.statusCode).toBe(401); // Missing token
  });
});
