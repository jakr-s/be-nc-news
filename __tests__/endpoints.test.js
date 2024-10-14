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
    test("GET /api/topics - should return an array of topics with correct properties", async () => {
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
    test("GET /api/articles/:article_id - should return the article with the specified ID and correct properties", async () => {
      const response = await request(app).get("/api/articles/1");
      expect(response.status).toBe(200);
      expect(response.body.article).toEqual(
        expect.objectContaining({
          author: "butter_bridge",
          title: "Living in the shadow of a great man",
          article_id: 1,
          body: "I find this existence challenging",
          topic: "mitch",
          created_at: expect.any(String),
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        })
      );
    });
  });

  describe("/api/articles", () => {
    test("GET /api/articles - should return an array of articles with correct properties", async () => {
      const response = await request(app).get("/api/articles");
      expect(response.status).toBe(200);
      expect(response.body.articles).toBeInstanceOf(Array);
      response.body.articles.forEach((article) => {
        expect(article).toEqual(
          expect.objectContaining({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          })
        );
        expect(article).not.toHaveProperty("body");
      });
    });
  });

  describe("error handling middleware", () => {
    test("GET /api/invalid-endpoint - should return 404 when the endpoint does not exist", async () => {
      const response = await request(app).get("/api/invalid-endpoint");
      expect(response.status).toBe(404);
      expect(response.body.msg).toBeDefined();
    });

    test("GET /api/articles/:article_id - should return 404 when the article with the specified ID does not exist", async () => {
      const response = await request(app).get("/api/articles/9999");
      expect(response.status).toBe(404);
      expect(response.body.msg).toBeDefined();
    });

    test("GET /api/articles/:article_id - should return 400 when the article ID is invalid", async () => {
      const response = await request(app).get("/api/articles/invalid");
      expect(response.status).toBe(400);
      expect(response.body.msg).toBeDefined();
    });
  });
});
