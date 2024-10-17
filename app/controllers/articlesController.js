const {
  fetchArticleById,
  fetchAllArticles,
  insertComment,
  updateArticleVotes,
  insertArticle,
  removeArticleById,
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
  try {
    const { sort_by, order, topic, limit, p } = req.query;
    const { articles, total_count } = await fetchAllArticles(
      sort_by,
      order,
      topic,
      limit,
      p
    );
    res.status(200).send({ articles, total_count });
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

exports.addArticle = async (req, res, next) => {
  try {
    const { author, title, body, topic, article_img_url } = req.body;
    if (!author || !title || !body || !topic) {
      return next({ status: 400, msg: "Bad request: missing required fields" });
    }
    const article = await insertArticle({
      author,
      title,
      body,
      topic,
      article_img_url,
    });
    res.status(201).send({ article });
  } catch (err) {
    next(err);
  }
};

exports.deleteArticleById = async (req, res, next) => {
  try {
    const { article_id } = req.params;
    await removeArticleById(article_id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
