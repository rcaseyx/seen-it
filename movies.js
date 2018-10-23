const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const passport = require('passport');
mongoose.Promise = global.Promise;

const { List, Movie } = require('./models');
const { localStrategy, jwtStrategy } = require('./auth');

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false });

router.get('/', jwtAuth, (req, res) => {
  Movie.find()
    .then(movies => {
      res.json({
        movies: movies.map(movie => movie.serialize())
      })
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

router.get('/:id', jwtAuth, (req,res) => {
  Movie.findById(req.params.id)
    .then(movie => res.json(movie.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

router.post('/', jwtAuth, (req, res) => {
  const requiredFields = ['title','releaseYear','image'];
  for(let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if(!(field in req.body)) {
      const message = `Missing ${field} in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Movie.create({
    title: req.body.title,
    releaseYear: req.body.releaseYear,
    image: req.body.image
  })
    .then(movie => res.status(201).json(movie.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

router.put('/:id', jwtAuth, (req, res) => {
  if(!(req.params.id === req.body.id)) {
    const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
    console.error(message);
    return res.status(400).json({ message: message });
  }

  const toUpdate = {};
  const field = 'image';

  if(field in req.body) {
    toUpdate[field] = req.body[field];
  }

  Movie.findByIdAndUpdate(req.params.id, { $set: toUpdate }, { new: true })
    .then(movie => res.status(201).json(movie.serialize()))
    .catch(err => res.status(500).json({ error: 'Internal Server Error' }));
});



module.exports = router;
