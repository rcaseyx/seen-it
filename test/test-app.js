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

function seedMovieData() {
  console.info('seeding List data');
  const seedData = [];

  for(let i = 1; i <=10; i++) {
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
    });



}

describe('Seen-O-Phile', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  after(function() {
    return closeServer();
  });

  it('should return 200 on index page', function() {
    return chai.request(app)
      .get('/')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });
});
