const request = require("supertest");
const app = require("../app/app");
const endpoints = require("../endpoints.json");

describe("/api", () => {
  test("GET /api - success", async () => {
    const response = await request(app).get("/api");
    expect(response.status).toBe(200);
    expect(response.body).toEqual(endpoints);
  });
});
