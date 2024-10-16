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
          comment_count: expect.any(String),
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

  describe("DELETE", () => {
    test("should delete an article and its comments, responding with 204", async () => {
      const response = await request(app).delete("/api/articles/1");
      expect(response.status).toBe(204);

      const articleResponse = await request(app).get("/api/articles/1");
      expect(articleResponse.status).toBe(404);

      const commentsResponse = await request(app).get(
        "/api/articles/1/comments"
      );
      expect(commentsResponse.status).toBe(204);
    });

    test("should ensure the article and its comments no longer exist in the database", async () => {
      await request(app).delete("/api/articles/1").expect(204);

      const articleCheck = await db.query(
        "SELECT * FROM articles WHERE article_id = $1",
        [1]
      );
      expect(articleCheck.rows.length).toBe(0);

      const commentsCheck = await db.query(
        "SELECT * FROM comments WHERE article_id = $1",
        [1]
      );
      expect(commentsCheck.rows.length).toBe(0);
    });

    test("should return 404 for non-existent article_id", async () => {
      const response = await request(app).delete("/api/articles/9999");
      expect(response.status).toBe(404);
      expect(response.body.msg).toBe("Article not found");
    });

    test("should return 400 for invalid article_id", async () => {
      const response = await request(app).delete("/api/articles/invalid");
      expect(response.status).toBe(400);
      expect(response.body.msg).toBeDefined();
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

    describe("Sort Queries", () => {
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

    describe("Topic Queries", () => {
      test("should return articles filtered by the specified topic", async () => {
        const { body } = await request(app)
          .get("/api/articles?topic=mitch")
          .expect(200);
        expect(body.articles).toBeInstanceOf(Array);
        body.articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });

      test("should return 200 and an empty array if no articles match the specified topic", async () => {
        const { body } = await request(app)
          .get("/api/articles?topic=nonexistent_topic")
          .expect(200);
        expect(body.articles).toBeInstanceOf(Array);
        expect(body.articles).toEqual([]);
      });
    });

    describe("Pagination Queries", () => {
      test("should return paginated articles with total_count", async () => {
        const response = await request(app).get("/api/articles?limit=5&p=2");
        expect(response.status).toBe(200);
        expect(response.body.articles).toBeInstanceOf(Array);
        expect(response.body.articles).toHaveLength(5);
        expect(response.body.total_count).toBeGreaterThan(5);
      });

      test("should return 400 for invalid limit", async () => {
        const response = await request(app).get("/api/articles?limit=invalid");
        expect(response.status).toBe(400);
        expect(response.body.msg).toBe("Invalid limit value");
      });

      test("should return 400 for invalid page", async () => {
        const response = await request(app).get("/api/articles?p=invalid");
        expect(response.status).toBe(400);
        expect(response.body.msg).toBe("Invalid page value");
      });
    });
  });

  describe("POST", () => {
    test("should add a new article and respond with newly added article", async () => {
      const newArticle = {
        author: "butter_bridge",
        title: "New Article",
        body: "This is the body of the new article.",
        topic: "mitch",
        article_img_url: "https://example.com/image.jpg",
      };

      const response = await request(app)
        .post("/api/articles")
        .send(newArticle);

      expect(response.status).toBe(201);
      expect(response.body.article).toEqual({
        author: "butter_bridge",
        title: "New Article",
        body: "This is the body of the new article.",
        topic: "mitch",
        article_img_url: "https://example.com/image.jpg",
        votes: 0,
        comment_count: 0,
        created_at: expect.any(String),
        article_id: expect.any(Number),
      });
    });

    test("should return 400 if required fields are missing", async () => {
      const newArticle = {
        author: "butter_bridge",
        title: "New Article",
        body: "This is the body of the new article.",
      };
      const response = await request(app)
        .post("/api/articles")
        .send(newArticle);
      expect(response.status).toBe(400);
      expect(response.body.msg).toBe("Bad request: missing required fields");
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

    test("should return 204 if no comments found for a valid article_id", async () => {
      const response = await request(app).get("/api/articles/9999/comments");
      expect(response.status).toBe(204);
    });

    test("should return 400 for invalid article_id", async () => {
      const response = await request(app).get("/api/articles/invalid/comments");
      expect(response.status).toBe(400);
      expect(response.body.msg).toBe("Bad Request");
    });

    describe("Pagination Queries", () => {
      test("should return paginated comments with total_count", async () => {
        const response = await request(app).get(
          "/api/articles/1/comments?limit=5&p=2"
        );
        expect(response.status).toBe(200);
        expect(response.body.comments).toBeInstanceOf(Array);
        expect(response.body.comments).toHaveLength(5);
        expect(response.body.total_count).toBeGreaterThan(5);
      });

      test("should return 400 for invalid limit", async () => {
        const response = await request(app).get(
          "/api/articles/1/comments?limit=invalid"
        );
        expect(response.status).toBe(400);
        expect(response.body.msg).toBe("Invalid limit value");
      });

      test("should return 400 for invalid page", async () => {
        const response = await request(app).get(
          "/api/articles/1/comments?p=invalid"
        );
        expect(response.status).toBe(400);
        expect(response.body.msg).toBe("Invalid page value");
      });
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
