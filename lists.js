const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
mongoose.Promise = global.Promise;

const { List, Movie } = require('./models');

router.get('/', (req, res) => {
  List.find()
    .then(lists => {
      res.json({
        lists: lists.map(list => list.serialize())
      })
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

router.get('/:id', (req, res) => {
  List.findById(req.params.id)
    .then(list => res.json(list.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

router.post('/', (req, res) => {
  const requiredFields = ['title','movies'];
  for(let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if(!(field in req.body)) {
      const message = `Missing ${field} in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  List.create({
    title: req.body.title,
    movies: req.body.movies
  })
    .then(list => res.status(201).json(list.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});







module.exports = router;
