const { fetchTopics } = require("../models/topics");
const {
  fetchArticleById,
  fetchAllArticles,
  fetchCommentsByArticleId,
  insertComment,
} = require("../models/articles");

exports.getTopics = async (req, res, next) => {
  try {
    const topics = await fetchTopics();
    res.status(200).send({ topics });
  } catch (err) {
    next(err);
  }
};

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
  try {
    const articles = await fetchAllArticles();
    res.status(200).send({ articles });
  } catch (err) {
    next(err);
  }
};

exports.getCommentsByArticleId = async (req, res, next) => {
  try {
    const { article_id } = req.params;
    const comments = await fetchCommentsByArticleId(article_id);
    if (!comments.length) {
      return next({ status: 404, msg: "Comments not found" });
    }
    res.status(200).send({ comments });
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
