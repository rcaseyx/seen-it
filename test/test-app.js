'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require('faker');

const { app, runServer, closeServer } = require('../server');
const { User, List, Movie } = require('../models');
const {TEST_DATABASE_URL} = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

function seedSeenItData() {
  seedMovieData();
  seedListData();
}

function seedMovieData() {
  console.info('seeding Movie data');
  const seedData = [];

  for(let i = 1; i <=2; i++) {
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
  const movies = [];

  Movie.find()
    .then(function(_movies) {
      _movies.forEach(movie => movies.push(movie.id));

      return {
        title: faker.company.companyName(),
        movies: [movies[0], movies[1]]
      };
    });
}

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.db.dropDatabase();
}

describe('Seen-O-Phile', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedSeenItData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('GET endpoints', function() {
    it('should return all existing lists', function() {
      let res;
      return chai.request(app)
        .get('/lists')
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body.lists).to.have.lengthOf.at.least(1);
          return List.count();
        })
        .then(function (count) {
          expect(res.body.lists).to.have.lengthOf(count);
        });
    });
  });
});
