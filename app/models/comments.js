const db = require("../../db/connection");
const format = require("pg-format");

exports.removeCommentById = async (comment_id) => {
  const queryStr = format(
    `DELETE FROM comments
     WHERE comment_id = %L
     RETURNING *;`,
    comment_id
  );

  const result = await db.query(queryStr);
  if (result.rows.length === 0) {
    return Promise.reject({ status: 404, msg: "Comment not found" });
  }
};

exports.updateCommentVotes = async (comment_id, inc_votes) => {
  const queryStr = format(
    `UPDATE comments
     SET votes = votes + %L
     WHERE comment_id = %L
     RETURNING *;`,
    inc_votes,
    comment_id
  );

  const result = await db.query(queryStr);
  if (result.rows.length === 0) {
    return Promise.reject({ status: 404, msg: "Comment not found" });
  }
  return result.rows[0];
};
