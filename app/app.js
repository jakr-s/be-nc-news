const express = require("express");
const app = express();

const articlesRouter = require("./routers/articlesRouter");
const commentsRouter = require("./routers/commentsRouter");
const topicsRouter = require("./routers/topicsRouter");
const usersRouter = require("./routers/usersRouter");
const endpoints = require("../endpoints.json");

const { errorHandler } = require("./middleware/errorHandler");

app.use(express.json());

app.get("/api", (req, res) => {
  res.status(200).send(endpoints);
});

app.use("/api/topics", topicsRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/users", usersRouter);

// Handle 404 for undefined routes
app.use((req, res, next) => {
  res.status(404).send({ msg: "Resource not found" });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;

/**
 * TODO: Implement null return to models
 * - Ensure that all model functions return null when no data is found
 * - Update relevant tests to check for null returns
 * - Refactor controllers to handle null returns appropriately
 */