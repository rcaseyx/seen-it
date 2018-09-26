const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
mongoose.Promise = global.Promise;

const { List, Movie } = require('./models');

router.get('/', (req, res) => {
  Movie.find()
    .then(movies => {
      res.json(movies)
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});







module.exports = router;
