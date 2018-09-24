'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { app, runServer, closeServer } = require('../server');
const { User, List, Movie } = require('../models');
const {DATABASE_URL} = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Seen-O-Phile', function() {
  before(function() {
    return runServer(DATABASE_URL);
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
