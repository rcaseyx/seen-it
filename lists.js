const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const passport = require('passport');
mongoose.Promise = global.Promise;

const { List, Movie } = require('./models');
const { User } = require('./users/models')
const { localStrategy, jwtStrategy } = require('./auth');

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false });

router.get('/', jwtAuth, (req, res) => {
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

router.get('/:id', jwtAuth, (req, res) => {
  List.findById(req.params.id)
    .then(list => res.json(list.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

router.post('/', jwtAuth, (req, res) => {
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
    private: req.body.private
  })
    .then(list => res.status(201).json(list.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

router.put('/:id', jwtAuth, (req, res) => {
  if(!(req.params.id === req.body.id)) {
    const message = `Request path id (${req.params.id}) and request body id ${req.body.id} must match`;
    console.error(message);
    return res.status(400).json({ message: message });
  }

  List.findById(req.params.id)
    .then(list => {
      if(!(req.body.user === list.createdBy.id)) {
        return res.status(400).json({ message: 'Only the creator of this list may make edits.' });
      }
      else {
        const toUpdate = {};
        const updateableFields = ['title', 'movies', 'private'];

        updateableFields.forEach(field => {
          if(field in req.body) {
            toUpdate[field] = req.body[field];
          }
        });

        List.findByIdAndUpdate(req.params.id, { $set: toUpdate }, { new: true })
          .then(list => res.status(201).json(list.serialize()))
          .catch(err => res.status(500).json({ error: 'Internal Server Error' }));
      }
    })
    .catch(err => res.status(500).json({ message: 'Internal Server Error'}));
});

router.delete('/:id', jwtAuth, (req, res) => {
  List.findByIdAndRemove(req.params.id)
    .then(list => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal Server Error'}));
});







module.exports = router;
