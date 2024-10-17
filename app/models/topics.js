const db = require("../../db/connection");
const format = require("pg-format");

exports.fetchTopics = async () => {
  const result = await db.query("SELECT slug, description FROM topics;");
  return result.rows;
};

exports.insertTopic = async (slug, description) => {
  if (!slug || !description) {
    return Promise.reject({
      status: 400,
      msg: "Bad request: missing required fields",
    });
  }

  const queryStr = format(
    `INSERT INTO topics (slug, description)
     VALUES (%L, %L)
     RETURNING *;`,
    slug,
    description
  );

  const result = await db.query(queryStr);
  return result.rows[0];
};
