const express = require("express");
const { getTopics, addTopic } = require("../controllers/topicsController");

const topicsRouter = express.Router();

topicsRouter.route("/")
  .get(getTopics)
  .post(addTopic);

module.exports = topicsRouter;
