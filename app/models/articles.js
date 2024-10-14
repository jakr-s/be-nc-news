const db = require("../../db/connection");

exports.fetchArticleById = async (article_id) => {
  const result = await db.query(
    `SELECT * FROM articles
      WHERE article_id = $1;`,
    [article_id]
  );
  return result.rows[0];
};
