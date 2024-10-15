const request = require("supertest");
const app = require("../app/app");
const endpoints = require("../endpoints.json");

const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed.js");
const db = require("../db/connection.js");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("/api", () => {
  describe("GET", () => {
    test("should return a list of all available API endpoints", async () => {
      const response = await request(app).get("/api");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(endpoints);
    });
  });
});
