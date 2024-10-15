const { fetchTopics } = require("../models/topics");
const {
  fetchArticleById,
  fetchAllArticles,
  fetchCommentsByArticleId,
  insertComment,
  updateArticleVotes,
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
  const { sort_by = "created_at", order = "desc" } = req.query;

  try {
    const articles = await fetchAllArticles(sort_by, order);
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

exports.patchArticleVotes = async (req, res, next) => {
  try {
    const { article_id } = req.params;
    const { inc_votes } = req.body;
    const updatedArticle = await updateArticleVotes(article_id, inc_votes);
    res.status(200).send({ article: updatedArticle });
  } catch (err) {
    // console.error(err);
    next(err);
  }
};

const { removeCommentById } = require("../models/comments");

exports.deleteCommentById = async (req, res, next) => {
  const { comment_id } = req.params;
  try {
    await removeCommentById(comment_id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const { fetchAllUsers } = require("../models/users");

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await fetchAllUsers();
    res.status(200).send({ users });
  } catch (err) {
    next(err);
  }
};
