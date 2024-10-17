exports.errorHandler = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad Request" });
  }

  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }

  res.status(500).send({ msg: "Internal Server Error" });
  console.error(err)
};
