const request = require("supertest");
const app = require("../app/app");

const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed.js");
const db = require("../db/connection.js");

beforeEach(() => seed(data));
afterAll(() => db.end());

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

describe("DELETE /api/comments/:comment_id", () => {
  test("should delete the given comment and respond with 204", async () => {
    const response = await request(app).delete("/api/comments/1");
    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  test("should return 404 for non-existent comment_id", async () => {
    const response = await request(app).delete("/api/comments/9999");
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("Comment not found");
  });

  test("should return 400 for invalid comment_id", async () => {
    const response = await request(app).delete("/api/comments/invalid");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Bad Request");
  });
});
