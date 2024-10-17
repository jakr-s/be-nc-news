const request = require("supertest");
const app = require("../app/app");

const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed.js");
const db = require("../db/connection.js");

beforeEach(() => seed(data));
afterAll(() => db.end());

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

  describe("POST", () => {
    test("should add a new topic and return it", async () => {
      const newTopic = {
        slug: "new_topic",
        description: "A new topic description",
      };
      const response = await request(app).post("/api/topics").send(newTopic);
      expect(response.status).toBe(201);
      expect(response.body.topic).toEqual(
        expect.objectContaining({
          slug: "new_topic",
          description: "A new topic description",
        })
      );

      const getResponse = await request(app).get("/api/topics");
      const topics = getResponse.body.topics;
      const addedTopic = topics.find((topic) => topic.slug === "new_topic");
      expect(addedTopic).toEqual(
        expect.objectContaining({
          slug: "new_topic",
          description: "A new topic description",
        })
      );
    });
    test("should return 400 for missing required fields", async () => {
      const response = await request(app).post("/api/topics").send({});
      expect(response.status).toBe(400);
      expect(response.body.msg).toBe("Bad request: missing required fields");
    });
  });
});
