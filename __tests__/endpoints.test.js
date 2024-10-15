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
    describe("GET", () => {
      test("should return a list of all available API endpoints", async () => {
        const response = await request(app).get("/api");
        expect(response.status).toBe(200);
        expect(response.body).toEqual(endpoints);
      });
    });
  });

  describe("/api/topics", () => {
    describe("GET", () => {
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
  });

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

      test("should return articles sorted by date in descending order", async () => {
        const response = await request(app).get("/api/articles");
        const articles = response.body.articles;
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
    });
  });

  describe("/api/articles/:article_id/comments", () => {
    describe("GET", () => {
      test("should return an array of comments for the given article_id", async () => {
        const response = await request(app).get("/api/articles/1/comments");
        expect(response.status).toBe(200);
        expect(response.body.comments).toBeInstanceOf(Array);
        response.body.comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: expect.any(Number),
            })
          );
        });
      });

      test("should return 404 if no comments found for the given article_id", async () => {
        const response = await request(app).get("/api/articles/9999/comments");
        expect(response.status).toBe(404);
        expect(response.body.msg).toBe("Comments not found");
      });

      test("should return 400 for invalid article_id", async () => {
        const response = await request(app).get(
          "/api/articles/invalid/comments"
        );
        expect(response.status).toBe(400);
        expect(response.body.msg).toBe("Bad Request");
      });
    });

    describe("POST", () => {
      test("should add a comment to the given article_id", async () => {
        const newComment = {
          username: "butter_bridge",
          body: "Great article!",
        };
        const response = await request(app)
          .post("/api/articles/1/comments")
          .send(newComment);
        expect(response.status).toBe(201);
        expect(response.body.comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            votes: 0,
            created_at: expect.any(String),
            author: "butter_bridge",
            body: "Great article!",
            article_id: 1,
          })
        );
      });

      test("should return 400 for missing required fields", async () => {
        const response = await request(app)
          .post("/api/articles/1/comments")
          .send({});
        expect(response.status).toBe(400);
        expect(response.body.msg).toBe("Bad request: missing required fields");
      });

      test("should return 404 for non-existent article_id", async () => {
        const newComment = {
          username: "butter_bridge",
          body: "Great article!",
        };
        const response = await request(app)
          .post("/api/articles/9999/comments")
          .send(newComment);
        expect(response.status).toBe(404);
        expect(response.body.msg).toBe("Article not found");
      });

      test("should return 400 for invalid article_id", async () => {
        const newComment = {
          username: "butter_bridge",
          body: "Great article!",
        };
        const response = await request(app)
          .post("/api/articles/invalid/comments")
          .send(newComment);
        expect(response.status).toBe(400);
        expect(response.body.msg).toBeDefined();
      });
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
