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
  topic,
  limit = 10,
  p = 1
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

  if (isNaN(limit) || limit < 1) {
    return Promise.reject({ status: 400, msg: "Invalid limit value" });
  }

  if (isNaN(p) || p < 1) {
    return Promise.reject({ status: 400, msg: "Invalid page value" });
  }

  const offset = (p - 1) * limit;

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

  queryStr += ` GROUP BY articles.article_id ORDER BY ${sort_by} ${order} LIMIT $${
    queryParams.length + 1
  } OFFSET $${queryParams.length + 2};`;
  queryParams.push(limit, offset);

  const articlesResult = await db.query(queryStr, queryParams);

  let totalCountQueryStr = `
    SELECT COUNT(*) AS total_count
    FROM articles
  `;

  if (topic) {
    totalCountQueryStr += ` WHERE articles.topic = $1 `;
  }

  const totalCountResult = await db.query(
    totalCountQueryStr,
    topic ? [topic] : []
  );

  return {
    articles: articlesResult.rows,
    total_count: parseInt(totalCountResult.rows[0].total_count, 10),
  };
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

exports.insertArticle = async ({
  author,
  title,
  body,
  topic,
  article_img_url,
}) => {
  const queryStr = format(
    `INSERT INTO articles (author, title, body, topic, article_img_url)
     VALUES (%L, %L, %L, %L, COALESCE(%L, 'default_image_url'))
     RETURNING *`,
    author,
    title,
    body,
    topic,
    article_img_url
  );

  const result = await db.query(queryStr);
  const article = result.rows[0];

  const commentCountQueryStr = format(
    `SELECT COUNT(*)::int AS comment_count FROM comments WHERE article_id = %L`,
    article.article_id
  );
  const commentCountResult = await db.query(commentCountQueryStr);
  article.comment_count = commentCountResult.rows[0].comment_count;

  return article;
};
