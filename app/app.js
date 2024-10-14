const express = require('express');
const app = express();
const { getTopics } = require('./controllers/controllers');

app.get('/api/topics', getTopics);

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).send({ msg: 'Route not found' });
});

module.exports = app;