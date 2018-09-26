"user strict";

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
  movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

const userSchema = mongoose.Schema({
  userName: {
    type: String,
    unique: true
  },
  password: String,
  firstName: String,
  lastName: String,
  email: String,
  lists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'List' }],
  moviesSeen: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

/*listSchema.virtual('movieTitles').get(function() {
  for(let i = 0;i < this.movies.length;i ++) {
    if(i === (this.movies.length - 1)) {
      return `${this.movies[i].title}`;
    }
    else {
      return `${this.movies[i].title}, `;
    }
  }
});

movieSchema.virtual('movieTitles').get(function() {
  return `${this.title}`;
});

listSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    movies: [this.movieTitles]
  }
};
*/

listSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    movies: this.movies
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
  next();
});

listSchema.pre('findOne', function(next) {
  this.populate('movies');
  next();
});

const User = mongoose.model('User', userSchema);
const List = mongoose.model('List', listSchema);
const Movie = mongoose.model('Movie', movieSchema);

module.exports = { User, List, Movie };
