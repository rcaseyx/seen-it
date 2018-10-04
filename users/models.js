'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {type: String, default: ''},
  lastName: {type: String, default: ''},
  lists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'List' }],
  moviesSeen: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

userSchema.methods.serialize = function() {
  return {
    username: this.username || '',
    firstName: this.firstName || '',
    lastName: this.lastName || '',
    lists: this.lists,
    moviesSeen: this.moviesSeen
  };
};

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', userSchema);

module.exports = {User};
