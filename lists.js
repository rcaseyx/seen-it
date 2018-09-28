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


//not working. when the JSON is returned, it has the unchanged document. when you run get/:id,
//it doesn't have the movies that were originally there. just the ones added.
router.put('/:id', (req, res) => {
  if(!(req.params.id === req.body.id)) {
    const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
    console.error(message);
    return res.status(400).json({ message: message });
  }

  function getList(listId) {
    return List.findById(listId)
            .then(function(list) {
              let allMovies = [];
              list.movies.forEach(function(movie) {
                allMovies.push(movie.id);
              });
              return allMovies;
            })
            .catch(err => {
              console.error(err);
              res.status(500).json({ error: 'Internal Server Error' });
            });
  }

  let movieIds;
  getList(req.params.id).then(function(movies) {
      movieIds = movies;
  });

  console.log(movieIds);


  const toUpdate = {};
  const updateableFields = ['movies','private'];

  updateableFields.forEach(field => {
    if(field in req.body) {
      if(field === 'movies') {
        req.body.movies.forEach(movie => allMovies.push(movie));
        toUpdate.movies = allMovies;
      }
      else {
        toUpdate[field] = req.body[field];
      }
    }
  });

  List.findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(list => res.status(201).json(list.serialize()))
    .catch(err => res.status(500).json({ error: 'Internal Server Error' }));
});







module.exports = router;
