const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
mongoose.Promise = global.Promise;

const { List, Movie, User } = require('./models');

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
  const requiredFields = ['title','movies','createdBy','private'];
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
    movies: req.body.movies,
    createdBy: req.body.createdBy,
    private: true
  })
    .then(list => res.status(201).json(list.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

router.put('/:id', (req, res) => {
  if(!(req.params.id === req.body.id)) {
    const message = `Request path id (${req.params.id}) and request body id ${req.body.id} must match`;
    console.error(message);
    return res.status(400).json({ message: message });
  }

  const toUpdate = {};
  const updateableFields = ['title', 'movies', 'private'];

  updateableFields.forEach(field => {
    if(field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  List.findByIdAndUpdate(req.params.id, { $set: toUpdate }, { new: true })
    .then(list => res.status(201).json(list.serialize()))
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});







module.exports = router;
