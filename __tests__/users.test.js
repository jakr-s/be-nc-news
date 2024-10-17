const request = require("supertest");
const app = require("../app/app");

const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed.js");
const db = require("../db/connection.js");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("GET /api/users", () => {
  test("200: responds with an array of users", async () => {
    const {
      body: { users },
    } = await request(app).get("/api/users").expect(200);
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

  describe("GET /api/users/:username", () => {
    test("200: responds with a user object", async () => {
      const {
        body: { user },
      } = await request(app).get("/api/users/butter_bridge").expect(200);
      expect(user).toEqual(
        expect.objectContaining({
          username: "butter_bridge",
          name: "jonny",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        })
      );
    });

    test("404: responds with an error message when user not found", async () => {
      const { body } = await request(app)
        .get("/api/users/nonexistent_user")
        .expect(404);
      expect(body.msg).toBe("User not found");
    });
  });
});
