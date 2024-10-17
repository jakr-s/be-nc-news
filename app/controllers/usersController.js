const { fetchAllUsers, fetchUserByUsername } = require("../models/users");

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await fetchAllUsers();
    res.status(200).send({ users });
  } catch (err) {
    next(err);
  }
};

exports.getUserByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await fetchUserByUsername(username);
    if (!user) {
      return next({ status: 404, msg: "User not found" });
    }
    res.status(200).send({ user });
  } catch (err) {
    next(err);
  }
};
