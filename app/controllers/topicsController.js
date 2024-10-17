const { fetchTopics, insertTopic } = require("../models/topics");

exports.getTopics = async (req, res, next) => {
  try {
    const topics = await fetchTopics();
    res.status(200).send({ topics });
  } catch (err) {
    next(err);
  }
};

exports.addTopic = async (req, res, next) => {
  try {
    const { slug, description } = req.body;
    const newTopic = await insertTopic(slug, description);
    res.status(201).send({ topic: newTopic });
  } catch (err) {
    next(err);
  }
};
