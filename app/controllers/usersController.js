const { fetchAllUsers } = require("../models/users");

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await fetchAllUsers();
    res.status(200).send({ users });
  } catch (err) {
    next(err);
  }
};
