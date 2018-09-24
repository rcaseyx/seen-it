"user strict";

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
  userName: {
    type: String,
    unique: true
  },
  password: String,
  firstName: String,
  lastName: String,
  email: String,
  lists: [{ type: ObjectId, ref: 'List' }],
  moviesSeen: [{ type: ObjectId, ref: 'Movie' }]
});

const listSchema = mongoose.Schema({
  title: String,
  movies: [{ type: ObjectId, ref: 'Movie' }]
});

const movieSchema = mongoose.Schema({
  title: String,
  releaseYear: String,
  image: String
});

userSchema.pre('find', function(next) {
  this.populate('lists');
  this.populate('moviesSeen');
  next();
});

userSchema.pre('findOne', function(next) {
  this.populate('lists');
  this.populate('moviesSeen');
  next();
});

listSchema.pre('find', function(next) {
  this.populate('movies');
});

listSchema.pre('findOne', function(next) {
  this.populate('movies');
});

const User = mongoose.model('User', userSchema);
const List = mongoose.model('List', listSchema);
const Movie = mongoose.model('Movie', movieSchema);

module.exports = { User, List, Movie };
