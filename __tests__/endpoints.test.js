const request = require("supertest");
const app = require("../app/app");
const endpoints = require("../endpoints.json");

const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed.js");
const db = require("../db/connection.js");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("endpoints", () => {
  describe("/api", () => {
    test("GET /api - should return a list of all available API endpoints", async () => {
      const response = await request(app).get("/api");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(endpoints);
    });
  });

  describe("/api/topics", () => {
    test("GET /api/topics - success", async () => {
      const response = await request(app).get("/api/topics");
      expect(response.status).toBe(200);
      expect(response.body.topics).toBeInstanceOf(Array);
      expect(response.body.topics).toHaveLength(3);
      response.body.topics.forEach((topic) => {
        expect(topic).toEqual(
          expect.objectContaining({
            slug: expect.any(String),
            description: expect.any(String),
          })
        );
      });
    });
  });

  describe("/api/articles/:article_id", () => {
    test("GET /api/articles/:article_id - success", async () => {
      const response = await request(app).get("/api/articles/1");
      expect(response.status).toBe(200);
      expect(response.body.article).toHaveProperty("author");
      expect(response.body.article).toHaveProperty("title");
      expect(response.body.article).toHaveProperty("article_id");
      expect(response.body.article).toHaveProperty("body");
      expect(response.body.article).toHaveProperty("topic");
      expect(response.body.article).toHaveProperty("created_at");
      expect(response.body.article).toHaveProperty("votes");
      expect(response.body.article).toHaveProperty("article_img_url");
    });

    test("GET /api/articles/:article_id - article not found", async () => {
      const response = await request(app).get("/api/articles/9999");
      expect(response.status).toBe(404);
      expect(response.body.msg).toBe("Article not found");
    });

    test("GET /api/articles/:article_id - invalid article ID", async () => {
      const response = await request(app).get("/api/articles/invalid");
      expect(response.status).toBe(400);
      expect(response.body.msg).toBe("Invalid article ID");
    });
  });

  describe("error handling middleware", () => {
    test("GET /api/invalid-endpoint - 404 error", async () => {
      const response = await request(app).get("/api/invalid-endpoint");
      expect(response.status).toBe(404);
    });
  });
});
