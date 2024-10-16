const express = require("express");
const { getTopics } = require("../controllers/topicsController");

const topicsRouter = express.Router();

topicsRouter.route("/").get(getTopics);

module.exports = topicsRouter;
