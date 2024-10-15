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
