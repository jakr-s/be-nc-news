const request = require('supertest');
const app = require('../app/app');

const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed.js");
const db = require("../db/connection.js");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe('/api/topics', () => {
  test('GET /api/topics - success', async () => {
    const response = await request(app).get('/api/topics');
    expect(response.status).toBe(200);
    expect(response.body.topics).toBeInstanceOf(Array);
    response.body.topics.forEach(topic => {
      expect(topic).toHaveProperty('slug');
      expect(topic).toHaveProperty('description');
    });
  });

  test('GET /api/invalid-endpoint - 404 error', async () => {
    const response = await request(app).get('/api/invalid-endpoint');
    expect(response.status).toBe(404);
  });
});