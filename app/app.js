const express = require("express");
const app = express();
const {
  getTopics,
  getArticleById,
  getAllArticles,
  getCommentsByArticleId,
  addCommentToArticle,
  updateArticleVotes,
} = require("./controllers/controllers");
const endpoints = require("../endpoints.json");
const errorHandler = require("./middleware/errorHandler");

app.use(express.json());

app.get("/api", (req, res) => {
  res.status(200).send(endpoints);
});

app.get("/api/topics", getTopics);

app.get("/api/articles", getAllArticles);

app.get("/api/articles/:article_id", getArticleById);
app.patch("/api/articles/:article_id", updateArticleVotes);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", addCommentToArticle);

// Handle 404 for undefined routes
app.use((req, res, next) => {
  res.status(404).send({ msg: "Resource not found" });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
