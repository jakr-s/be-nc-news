const db = require("../../db/connection");
const format = require("pg-format");

exports.fetchArticleById = async (article_id) => {
  const queryStr = format(
    `SELECT articles.*, COUNT(comments.comment_id) AS comment_count
     FROM articles
     LEFT JOIN comments ON comments.article_id = articles.article_id
     WHERE articles.article_id = %L
     GROUP BY articles.article_id;`,
    article_id
  );
  const result = await db.query(queryStr);
  return result.rows[0];
};

exports.fetchAllArticles = async (
  sort_by = "created_at",
  order = "desc",
  topic
) => {
  const validSortColumns = [
    "author",
    "title",
    "article_id",
    "topic",
    "created_at",
    "votes",
    "article_img_url",
    "comment_count",
  ];
  const validOrderValues = ["asc", "desc"];

  if (!validSortColumns.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort_by column" });
  }

  if (!validOrderValues.includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid order value" });
  }

  let queryStr = `
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
  `;

  const queryParams = [];

  if (topic) {
    queryStr += ` WHERE articles.topic = $1 `;
    queryParams.push(topic);
  }

  queryStr += ` GROUP BY articles.article_id ORDER BY ${sort_by} ${order};`;

  const result = await db.query(queryStr, queryParams);
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
