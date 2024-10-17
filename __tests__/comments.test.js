const request = require("supertest");
const app = require("../app/app");

const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed.js");
const db = require("../db/connection.js");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("/api/comments/:comment_id", () => {
  describe("DELETE", () => {
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

  describe("PATCH", () => {
    test("should update the votes on a comment and respond with the updated comment", async () => {
      const response = await request(app)
        .patch("/api/comments/1")
        .send({ inc_votes: 1 })
        .expect(200);
      expect(response.body.comment).toEqual(
        expect.objectContaining({
          comment_id: 1,
          votes: 17,
        })
      );
    });

    test("should return 404 for non-existent comment_id", async () => {
      const response = await request(app)
        .patch("/api/comments/9999")
        .send({ inc_votes: 1 })
        .expect(404);
      expect(response.body.msg).toBe("Comment not found");
    });

    test("should return 400 for invalid comment_id", async () => {
      const response = await request(app)
        .patch("/api/comments/invalid")
        .send({ inc_votes: 1 })
        .expect(400);
      expect(response.body.msg).toBe("Bad Request");
    });

    test("should return 400 for invalid inc_votes", async () => {
      const response = await request(app)
        .patch("/api/comments/1")
        .send({ inc_votes: "invalid" })
        .expect(400);
      expect(response.body.msg).toBe("Bad request: inc_votes must be a number");
    });
  });
});
