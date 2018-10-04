'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const movieSchema = mongoose.Schema({
  title: {
    type: String,
    unique: true
  },
  releaseYear: String,
  image: String
});

const listSchema = mongoose.Schema({
  title: String,
  movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  private: Boolean
});

listSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    movies: this.movies,
    createdBy: this.createdBy,
    private: this.private
  }
};

movieSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    releaseYear: this.releaseYear,
    image: this.image
  }
};

listSchema.pre('find', function(next) {
  this.populate('movies');
  this.populate('createdBy');
  next();
});

listSchema.pre('findOne', function(next) {
  this.populate('createdBy');
  this.populate('movies');
  next();
});

const List = mongoose.model('List', listSchema);
const Movie = mongoose.model('Movie', movieSchema);

module.exports = { List, Movie };
