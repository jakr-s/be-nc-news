const { fetchTopics } = require("../models/topics");

exports.getTopics = async (req, res, next) => {
  try {
    const topics = await fetchTopics();
    res.status(200).send({ topics });
  } catch (err) {
    next(err);
  }
};

const { fetchArticleById } = require("../models/articles");

exports.getArticleById = async (req, res, next) => {
  try {
    const { article_id } = req.params;
    const article = await fetchArticleById(article_id);
    if (!article) {
      return res.status(404).send({ msg: "Article not found" });
    }
    res.status(200).send({ article });
  } catch (err) {
    if (err.code === "22P02") {
      res.status(400).send({ msg: "Invalid article ID" });
    } else {
      next(err);
    }
  }
};
