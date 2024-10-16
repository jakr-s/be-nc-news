const express = require('express');
const { getAllUsers } = require('../controllers/usersController');

const usersRouter = express.Router();

usersRouter.route('/')
  .get(getAllUsers);

module.exports = usersRouter;