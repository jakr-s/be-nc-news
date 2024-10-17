const db = require("../../db/connection");
const format = require("pg-format");

exports.fetchAllUsers = async () => {
  const result = await db.query(
    `SELECT username, name, avatar_url
     FROM users;`
  );
  return result.rows;
};

exports.fetchUserByUsername = async (username) => {
  const query = format(
    `SELECT username, name, avatar_url
     FROM users
     WHERE username = %L;`,
    username
  );
  const result = await db.query(query);
  return result.rows[0] || null;
};
