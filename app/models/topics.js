const db = require('../../db/connection');

exports.fetchTopics = async () => {
  const result = await db.query('SELECT slug, description FROM topics;');
  return result.rows;
};