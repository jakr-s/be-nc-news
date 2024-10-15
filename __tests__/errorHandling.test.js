const request = require("supertest");
const app = require("../app/app");

const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed.js");
const db = require("../db/connection.js");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("error handling middleware", () => {
  test("should return 404 when the endpoint does not exist", async () => {
    const response = await request(app).get("/api/invalid-endpoint");
    expect(response.status).toBe(404);
    expect(response.body.msg).toBeDefined();
  });
});
