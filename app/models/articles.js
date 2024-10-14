const db = require("../../db/connection");

exports.fetchArticleById = async (article_id) => {
  const result = await db.query(
    `SELECT * FROM articles
      WHERE article_id = $1;`,
    [article_id]
  );
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
  const result = await db.query(
    `SELECT comment_id, votes, created_at, author, body, article_id
     FROM comments
     WHERE article_id = $1
     ORDER BY created_at DESC;`,
    [article_id]
  );
  return result.rows;
};
