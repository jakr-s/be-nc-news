const { fetchCommentsByArticleId } = require("../models/articles");
const { removeCommentById } = require("../models/comments");

exports.getCommentsByArticleId = async (req, res, next) => {
  try {
    const { article_id } = req.params;
    const comments = await fetchCommentsByArticleId(article_id);
    if (comments.length === 0) {
      res.status(204).send();
    }
    res.status(200).send({ comments });
  } catch (err) {
    next(err);
  }
};

exports.deleteCommentById = async (req, res, next) => {
  const { comment_id } = req.params;
  try {
    await removeCommentById(comment_id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
