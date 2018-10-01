const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
mongoose.Promise = global.Promise;

const { List, Movie, User } = require('./models');

router.get('/', (req, res) => {
  User.find()
    .then(users => {
      res.json({
        users: users.map(user => user.serialize())
      })
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

router.get('/:id', (req, res) => {
  User.findById(req.params.id)
    .then(user => res.json(user.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

router.post('/', (req, res) => {
  const requiredFields = ['userName','password','firstName','lastName','email'];
  for(let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if(!(field in req.body)) {
      const message = `Missing ${field} in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  User.create({
    userName: req.body.userName,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    lists: [],
    moviesSeen: []
  })
    .then(user => res.status(201).json(user.serialize()))
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
  const updateableFields = ['email', 'moviesSeen', 'lists'];

  updateableFields.forEach(field => {
    if(field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  User.findByIdAndUpdate(req.params.id, { $set: toUpdate }, { new: true })
    .then(user => res.status(201).json(user.serialize()))
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});










module.exports = router;
