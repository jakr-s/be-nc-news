const errorHandler = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad Request" });
    return next();
  }

  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
    return next();
  }

  // console.error(err)
  res.status(500).send({ msg: "Internal Server Error" });
  return next();
};

module.exports = errorHandler;
