const errorHandler = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad Request" });
  } else if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    console.error(err)
    res.status(500).send({ msg: "Internal Server Error" });
  }
};

module.exports = errorHandler;
