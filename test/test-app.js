const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Seen-O-Phile', function() {
  before(function() {
    return runServer();
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

  it('should return 200 on defaultLists page', function() {
    return chai.request(app)
      .get('/defaultLists.html')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });
});
