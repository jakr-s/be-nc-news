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
    test("should return a list of all available API endpoints", async () => {
      const response = await request(app).get("/api");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(endpoints);
    });
  });

  describe("/api/topics", () => {
    test("should return an array of topics with correct properties", async () => {
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
    test("should return the article with the specified ID and correct properties", async () => {
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

    test("should return 404 when the article with the specified ID does not exist", async () => {
      const response = await request(app).get("/api/articles/9999");
      expect(response.status).toBe(404);
      expect(response.body.msg).toBeDefined();
    });

    test("should return 400 when the article ID is invalid", async () => {
      const response = await request(app).get("/api/articles/invalid");
      expect(response.status).toBe(400);
      expect(response.body.msg).toBeDefined();
    });
  });

  describe("GET /api/articles", () => {
    test("should respond with a 200 status code and an array of articles", async () => {
      const response = await request(app).get("/api/articles");
      const articles = response.body.articles;
      const expectedProperties = [
        "author",
        "title",
        "article_id",
        "topic",
        "created_at",
        "votes",
        "article_img_url",
        "comment_count",
      ];

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.articles)).toBe(true);
      articles.forEach((article) => {
        expectedProperties.forEach((prop) => {
          expect(article).toHaveProperty(prop);
        });
        expect(article).not.toHaveProperty("body");
      });
    });

    test("should return articles sorted by date in descending order", async () => {
      const response = await request(app).get("/api/articles");
      const articles = response.body.articles;
      expect(articles).toBeSortedBy("created_at", { descending: true });
    });
  });

  describe("GET /api/articles/:article_id/comments", () => {
    test("should return an array of comments for the given article_id", async () => {
      const response = await request(app).get("/api/articles/1/comments");
      expect(response.status).toBe(200);
      expect(response.body.comments).toBeInstanceOf(Array);
      response.body.comments.forEach((comment) => {
        expect(comment).toHaveProperty("comment_id");
        expect(comment).toHaveProperty("votes");
        expect(comment).toHaveProperty("created_at");
        expect(comment).toHaveProperty("author");
        expect(comment).toHaveProperty("body");
        expect(comment).toHaveProperty("article_id");
      });
    });

    test("should return 404 if no comments found for the given article_id", async () => {
      const response = await request(app).get("/api/articles/9999/comments");
      expect(response.status).toBe(404);
      expect(response.body.msg).toBe("Comments not found");
    });

    test("should return 400 for invalid article_id", async () => {
      const response = await request(app).get("/api/articles/invalid/comments");
      expect(response.status).toBe(400);
      expect(response.body.msg).toBeDefined();
    });
  });
});

describe("error handling middleware", () => {
  test("should return 404 when the endpoint does not exist", async () => {
    const response = await request(app).get("/api/invalid-endpoint");
    expect(response.status).toBe(404);
    expect(response.body.msg).toBeDefined();
  });
});
