const {
  fetchArticleById,
  fetchAllArticles,
  fetchCommentsByArticleId,
  insertComment,
  updateArticleVotes,
} = require("../models/articles");

exports.getArticleById = async (req, res, next) => {
  try {
    const { article_id } = req.params;
    const article = await fetchArticleById(article_id);
    if (!article) {
      return next({ status: 404, msg: "Article not found" });
    }
    res.status(200).send({ article });
  } catch (err) {
    next(err);
  }
};

exports.getAllArticles = async (req, res, next) => {
  const { sort_by = "created_at", order = "desc" } = req.query;

  try {
    const articles = await fetchAllArticles(sort_by, order);
    res.status(200).send({ articles });
  } catch (err) {
    next(err);
  }
};

exports.addCommentToArticle = async (req, res, next) => {
  try {
    const { article_id } = req.params;
    const { username, body } = req.body;
    if (!username || !body) {
      return next({ status: 400, msg: "Bad request: missing required fields" });
    }
    const article = await fetchArticleById(article_id);
    if (!article) {
      return next({ status: 404, msg: "Article not found" });
    }
    const comment = await insertComment(article_id, username, body);
    res.status(201).send({ comment });
  } catch (err) {
    next(err);
  }
};

exports.patchArticleVotes = async (req, res, next) => {
  try {
    const { article_id } = req.params;
    const { inc_votes } = req.body;
    const updatedArticle = await updateArticleVotes(article_id, inc_votes);
    res.status(200).send({ article: updatedArticle });
  } catch (err) {
    next(err);
  }
};
