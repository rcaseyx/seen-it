'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require('faker');

const { app, runServer, closeServer } = require('../server');
const { List, Movie } = require('../models');
const { User } = require('../users');
const {TEST_DATABASE_URL} = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

let userId;
let token;

function seedSeenItData() {
  seedMovieData();
  //seedListData();
}

function seedMovieData() {
  console.info('seeding Movie data');
  const seedData = [];

  for(let i = 1; i <=60; i++) {
    seedData.push(generateMovieData());
  }

  return Movie.insertMany(seedData);
}

function seedListData() {
  console.info('seeding List data');
  const seedData = [];

  for(let i = 1; i <=5; i++) {
    seedData.push(generateListData());
  }

  return List.insertMany(seedData);
}

function generateMovieData() {
  return {
    title: faker.company.companyName(),
    releaseYear: faker.date.past(),
    image: faker.image.imageUrl()
  };
}

function generateListData() {
  return {
    title: faker.company.companyName(),
    movies: []
  };
}

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.db.dropDatabase();
}

describe('Seen-O-Phile', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  before(function() {
    return seedSeenItData();
  });

  /*beforeEach(function() {
    return seedSeenItData();
  });

  afterEach(function() {
    return tearDownDb();
  });
*/
  after(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('POST endpoints and login', function() {
    it('should create a user and return user ID', function() {
      let data = {
        username: 'test.user',
        password: 'testingpassword'
      }
      let res;
      return chai.request(app)
        .post('/users')
        .send(data)
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res.body.id).to.not.be.null;
          expect(res.body.username).to.not.be.null;
          userId = res.body.id;
          return User.findById(userId);
        })
        .then(function(user) {
          expect(res.body.id).to.equal(user.id);
          expect(user.username).to.equal(data.username);
        });
    });

    it('should return auth token on login', function() {
      let data = {
        username: 'test.user',
        password: 'testingpassword'
      }
      let res;
      return chai.request(app)
        .post('/auth/login')
        .send(data)
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body.authToken).to.not.be.null;
          expect(res.body.user).to.be.a('object');
          token = res.body.authToken;
          return User.findById(res.body.user.id);
        })
        .then(function(user) {
          expect(res.body.user.id).to.equal(user.id);
          expect(res.body.user.username).to.equal(user.username);
        });
    });

    it('should create new Lists on POST', function() {
      let data = {
        title: faker.company.companyName(),
        movies: [],
        createdBy: userId,
        private: false
      };
      let auth = `Bearer ${token}`;
      return chai.request(app)
        .post('/lists')
        .set('Authorization', auth)
        .send(data)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.createdBy).to.equal(data.createdBy);
          expect(res.body.private).to.equal(data.private);
          return List.findById(res.body.id);
        })
        .then(function(list) {
          expect(data.title).to.equal(list.title);
          expect(data.createdBy).to.equal(list.createdBy.id);
          expect(data.private).to.equal(list.private);
        });
    });

    it('should create a new movie on POST', function() {
      let data = {
        title: faker.company.companyName(),
        releaseYear: faker.date.past(),
        image: faker.image.imageUrl()
      };
      let auth = `Bearer ${token}`;
      return chai.request(app)
        .post('/movies')
        .set('Authorization', auth)
        .send(data)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.image).to.equal(data.image);
          return Movie.findById(res.body.id);
        })
        .then(function(movie) {
          expect(data.title).to.equal(movie.title);
          expect(data.image).to.equal(movie.image);
        });
    });
  });

  describe('GET endpoints', function() {
    it('should return all existing lists', function() {
      let res;
      let auth = `Bearer ${token}`;
      return chai.request(app)
        .get('/lists')
        .set('Authorization', auth)
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body.lists).to.have.lengthOf.at.least(1);
          return List.count();
        })
        .then(function(count) {
          expect(res.body.lists).to.have.lengthOf(count);
        });
    });

    it('should return all existing movies', function() {
      let res;
      let auth = `Bearer ${token}`;
      return chai.request(app)
        .get('/movies')
        .set('Authorization', auth)
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body.movies).to.have.lengthOf.at.least(1);
          return Movie.count();
        })
        .then(function(count) {
          expect(res.body.movies).to.have.lengthOf(count);
        });
    });

    it('should return 401 on /lists if user is not recognized', function() {
      return chai.request(app)
        .get('/lists')
        .then(function(res) {
          expect(res).to.have.status(401);
        });
    });

    it('should return 401 on /movies if user is not recognized', function() {
      return chai.request(app)
        .get('/movies')
        .then(function(res) {
          expect(res).to.have.status(401);
        });
    });
  });

  describe('PUT endpoints', function() {
    it('should update list on PUT', function() {
      const updateData = {
        title: 'My New Title',
        private: true,
        user: userId
      };
      return List.findOne()
        .then(function(list) {
          let auth = `Bearer ${token}`;
          updateData.id = list._id;
          return chai.request(app)
            .put(`/lists/${list._id}`)
            .set('Authorization', auth)
            .send(updateData);
        })
        .then(function(res) {
          expect(res).to.have.status(201);

          return List.findById(updateData.id);
        })
        .then(function(list) {
          expect(list.title).to.equal(updateData.title);
          expect(list.private).to.equal(updateData.private);
        });
    });

    it('should update movie on PUT', function() {
      const updateData = {
        image: 'www.newimagelink.com/image.jpeg'
      };
      return Movie.findOne()
        .then(function(movie) {
          let auth = `Bearer ${token}`;
          updateData.id = movie._id;
          return chai.request(app)
            .put(`/movies/${movie._id}`)
            .set('Authorization', auth)
            .send(updateData);
        })
        .then(function(res) {
          expect(res).to.have.status(201);

          return Movie.findById(updateData.id);
        })
        .then(function(movie) {
          expect(movie.image).to.equal(updateData.image);
        });
    });

    it('should update user on PUT', function() {
      const updateData = {
        id: userId,
        moviesSeen: [],
        lists: []
      };
      return Movie.find()
        .limit(10)
        .then(function(movies) {
          movies.forEach(movie => updateData.moviesSeen.push(movie._id));
          return List.findOne();
        })
        .then(function(list) {
          updateData.lists.push(list._id);
          let auth = `Bearer ${token}`;
          return chai.request(app)
            .put(`/users/${userId}`)
            .set('Authorization', auth)
            .send(updateData);
        })
        .then(function(res) {
          expect(res).to.have.status(201);

          return User.findById(userId);
        })
        .then(function(user) {
          expect(user.moviesSeen).to.deep.equal(updateData.moviesSeen);
          expect(user.lists).to.deep.equal(updateData.lists);
        });
    });
  });

  describe('DELETE endpoints', function() {
    it('should delete lists on DELETE', function() {
      let auth = `Bearer ${token}`;
      let listId;
      return List.findOne()
        .then(function(list) {
          listId = list._id;
          return chai.request(app)
            .delete(`/lists/${listId}`)
            .set('Authorization', auth);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return List.findById(listId);
        })
        .then(function(_list) {
          expect(_list).to.be.null;
        });
    });

    it('should delete user on DELETE', function() {
      let auth = `Bearer ${token}`;
      let userId;
      return User.findOne()
        .then(function(user) {
          userId = user._id;
          return chai.request(app)
            .delete(`/users/${userId}`)
            .set('Authorization', auth);
        })
        .then(function(res) {
          expect(res).to.have.status(204);

          return User.findById(userId);
        })
        .then(function(_user) {
          expect(_user).to.be.null;
        });
    });
  });
});
