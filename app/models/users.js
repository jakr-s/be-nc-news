const db = require("../../db/connection");

exports.fetchAllUsers = async () => {
  const result = await db.query(
    `SELECT username, name, avatar_url
     FROM users;`
  );
  return result.rows;
};
