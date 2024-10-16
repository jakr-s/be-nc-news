const request = require("supertest");
const app = require("../app/app");

const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed.js");
const db = require("../db/connection.js");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("GET /api/users", () => {
  test("200: responds with an array of users", async () => {
    const { body: { users } } = await request(app).get("/api/users").expect(200);
    expect(users).toBeInstanceOf(Array);
    users.forEach((user) => {
      expect(user).toEqual(
        expect.objectContaining({
          username: expect.any(String),
          name: expect.any(String),
          avatar_url: expect.any(String),
        })
      );
    });
  });
});
