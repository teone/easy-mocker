(function () {
  'use strict';

  const request = require('supertest');
  const app = require('../src/server');
  const chai = require('chai');
  const expect = chai.expect;

  describe('From the base config', () => {

    beforeEach((done) => {
      const memory = require('../src/lib/in_memory');
      memory.setup()
      .then(() => {
        done();
      });
    });

    describe('when quering an endpoint', () => {
      it('should return an array', (done) => {
        request(app)
          .get('/api/users')
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.length).to.equal(2);
            done();
          })
      });
    });

    describe('when get an endpoint', () => {
      it('should return an array', (done) => {
        request(app)
          .get('/api/users/1')
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.id).to.equal(1);
            expect(res.body.name).to.equal('Jhon Snow');
            done();
          })
      });
    });
  });

})();