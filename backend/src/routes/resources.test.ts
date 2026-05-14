import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { store } from '../lib/store';

describe('resources API', () => {
  const app = createApp();

  beforeEach(() => {
    store.clear();
  });

  it('POST then GET — created resource keeps the chosen priority and an auto sentiment', async () => {
    const created = await request(app).post('/api/resources').send({
      name: 'Auth service',
      description: 'We finally shipped a clean working login',
      priority: 'high',
    });

    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({
      name: 'Auth service',
      sentiment: 'positive', // derived by the mock AI
      priority: 'high', // chosen by the user
    });
    expect(created.body.id).toEqual(expect.any(String));
    expect(created.body.createdAt).toEqual(expect.any(String));

    const list = await request(app).get('/api/resources');
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0].id).toBe(created.body.id);
  });

  it('GET /api/vibe-check aggregates resources added via POST', async () => {
    await request(app).post('/api/resources').send({
      name: 'Checkout',
      description: 'the payment flow is broken and crashed',
      priority: 'high',
    });

    const vibe = await request(app).get('/api/vibe-check');
    expect(vibe.status).toBe(200);
    expect(vibe.body.total).toBe(1);
    expect(vibe.body.status).toBe('Needs attention');
    expect(vibe.body.sentimentCounts.negative).toBe(1);
    expect(vibe.body.priorityCounts.high).toBe(1);
  });

  it('DELETE removes a resource', async () => {
    const created = await request(app)
      .post('/api/resources')
      .send({ name: 'Temp note', description: 'a quick scratch note', priority: 'low' });

    const deleted = await request(app).delete(`/api/resources/${created.body.id}`);
    expect(deleted.status).toBe(204);

    const list = await request(app).get('/api/resources');
    expect(list.body).toHaveLength(0);
  });

  it('DELETE returns 404 for an unknown id', async () => {
    const res = await request(app).delete('/api/resources/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error).toEqual(expect.any(String));
  });

  it('rejects an invalid body with 400 and an error message', async () => {
    const res = await request(app).post('/api/resources').send({ name: '', description: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toEqual(expect.any(String));
  });
});
