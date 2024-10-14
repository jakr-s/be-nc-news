const express = require("express");
const app = express();
const { getTopics, getArticleById } = require("./controllers/controllers");
const endpoints = require("../endpoints.json");

app.get("/api", (req, res) => {
  res.status(200).send(endpoints);
});

app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleById);

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).send({ msg: "Route not found" });
});

module.exports = app;
