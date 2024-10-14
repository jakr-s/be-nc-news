const express = require("express");
const app = express();
const { getTopics } = require("./controllers/controllers");
const endpoints = require("../endpoints.json");

app.get("/api", (req, res) => {
  res.status(200).json(endpoints);
});

app.get("/api/topics", getTopics);

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).send({ msg: "Route not found" });
});

module.exports = app;
