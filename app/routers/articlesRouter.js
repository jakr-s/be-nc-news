const express = require("express");
const {
  getArticleById,
  getAllArticles,
  addCommentToArticle,
  patchArticleVotes,
} = require("../controllers/articlesController");
const { getCommentsByArticleId } = require("../controllers/commentsController");

const articlesRouter = express.Router();

articlesRouter.route("/").get(getAllArticles);

articlesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleVotes);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(addCommentToArticle);

module.exports = articlesRouter;
