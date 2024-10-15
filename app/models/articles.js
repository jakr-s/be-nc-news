const db = require("../../db/connection");
const format = require("pg-format");

exports.fetchArticleById = async (article_id) => {
  const queryStr = format(
    `SELECT * FROM articles
     WHERE article_id = %L;`,
    article_id
  );

  const result = await db.query(queryStr);
  return result.rows[0];
};

exports.fetchAllArticles = async () => {
  const result = await db.query(`
    SELECT 
      articles.author, 
      articles.title, 
      articles.article_id, 
      articles.topic, 
      articles.created_at, 
      articles.votes, 
      articles.article_img_url,
      COUNT(comments.comment_id) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC;
  `);
  return result.rows;
};

exports.fetchCommentsByArticleId = async (article_id) => {
  const queryStr = format(
    `SELECT comment_id, votes, created_at, author, body, article_id
     FROM comments
     WHERE article_id = %L
     ORDER BY created_at DESC;`,
    article_id
  );

  const result = await db.query(queryStr);
  return result.rows;
};

exports.insertComment = async (article_id, username, body) => {
  const queryStr = format(
    `INSERT INTO comments (article_id, author, body, created_at, votes)
     VALUES (%L, %L, %L, NOW(), 0)
     RETURNING *;`,
    article_id,
    username,
    body
  );

  const result = await db.query(queryStr);
  return result.rows[0];
};

exports.updateArticleVotes = async (article_id, inc_votes) => {
  const queryStr = format(
    `UPDATE articles
     SET votes = votes + %L
     WHERE article_id = %L
     RETURNING *;`,
    inc_votes,
    article_id
  );

  const result = await db.query(queryStr);
  if (result.rows.length === 0) {
    return Promise.reject({ status: 404, msg: "Article not found" });
  }

  return result.rows[0];
};
