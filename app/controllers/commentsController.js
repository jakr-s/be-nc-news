const { fetchCommentsByArticleId } = require("../models/articles");
const { removeCommentById, updateCommentVotes } = require("../models/comments");

exports.getCommentsByArticleId = async (req, res, next) => {
  try {
    const { article_id } = req.params;
    const { limit, p } = req.query;
    const { comments, total_count } = await fetchCommentsByArticleId(
      article_id,
      limit,
      p
    );
    if (comments.length === 0) {
      res.status(204).send();
    } else {
      res.status(200).send({ comments, total_count });
    }
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

exports.patchCommentVotes = async (req, res, next) => {
  try {
    const { comment_id } = req.params;
    const { inc_votes } = req.body;
    if (typeof inc_votes !== "number") {
      throw { status: 400, msg: "Bad request: inc_votes must be a number" };
    }
    const updatedComment = await updateCommentVotes(comment_id, inc_votes);
    res.status(200).send({ comment: updatedComment });
  } catch (err) {
    next(err);
  }
};
