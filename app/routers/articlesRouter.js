const express = require("express");
const {
  getArticleById,
  getAllArticles,
  addCommentToArticle,
  patchArticleVotes,
  addArticle,
  deleteArticleById,
} = require("../controllers/articlesController");
const { getCommentsByArticleId } = require("../controllers/commentsController");

const articlesRouter = express.Router();

articlesRouter.route("/").get(getAllArticles).post(addArticle);

articlesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleVotes)
  .delete(deleteArticleById);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(addCommentToArticle);

module.exports = articlesRouter;
