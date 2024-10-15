const request = require("supertest");
const app = require("../app/app");

const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed.js");
const db = require("../db/connection.js");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("/api/articles/:article_id", () => {
  describe("GET", () => {
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

  describe("PATCH", () => {
    test("should return the updated article when votes are incremented", async () => {
      const { body } = await request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: 1 })
        .expect(200);
      expect(body.article.votes).toBe(101);
    });

    test("should return the updated article when votes are decremented", async () => {
      const { body } = await request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: -100 })
        .expect(200);
      expect(body.article.votes).toBe(0);
    });

    test("should return 400 with an error when inc_votes is not an integer", async () => {
      const { body } = await request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: "not-an-integer" })
        .expect(400);
      expect(body.msg).toBe("Bad Request");
    });

    test("should return 404 with an error when article_id does not exist", async () => {
      const { body } = await request(app)
        .patch("/api/articles/9999")
        .send({ inc_votes: 1 })
        .expect(404);
      expect(body.msg).toBe("Article not found");
    });
  });
});

describe("/api/articles", () => {
  describe("GET", () => {
    test("should return an array of articles with the correct properties", async () => {
      const response = await request(app).get("/api/articles");
      const articles = response.body.articles;
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.articles)).toBe(true);
      articles.forEach((article) => {
        expect(article).toEqual(
          expect.objectContaining({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(String),
          })
        );
        expect(article).not.toHaveProperty("body");
      });
    });

    test("should return articles sorted by date in descending order by default", async () => {
      const response = await request(app).get("/api/articles");
      const articles = response.body.articles;
      expect(articles).toBeSortedBy("created_at", { descending: true });
    });

    test("should return articles sorted by created_at by default", async () => {
      const { body } = await request(app).get("/api/articles").expect(200);
      expect(body.articles).toBeSortedBy("created_at", { descending: true });
    });

    test("should return articles sorted by any valid column", async () => {
      const { body } = await request(app)
        .get("/api/articles?sort_by=author")
        .expect(200);
      expect(body.articles).toBeSortedBy("author", { descending: true });
    });

    test("should return articles in ascending order when order=asc", async () => {
      const { body } = await request(app)
        .get("/api/articles?order=asc")
        .expect(200);
      expect(body.articles).toBeSortedBy("created_at", { descending: false });
    });

    test("should return 400 for invalid sort_by column", async () => {
      const { body } = await request(app)
        .get("/api/articles?sort_by=invalid_column")
        .expect(400);
      expect(body.msg).toBe("Invalid sort_by column");
    });

    test("should return 400 for invalid order value", async () => {
      const { body } = await request(app)
        .get("/api/articles?order=invalid_order")
        .expect(400);
      expect(body.msg).toBe("Invalid order value");
    });
  });
});
