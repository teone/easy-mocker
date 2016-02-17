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

    describe('when quering items', () => {
      it('should return an array', (done) => {
        request(app)
          .get('/api/users')
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.length).to.equal(2);
            done();
          })
      });

      describe('and query parameters are passed', () => {
        it('should filter result', (done) => {
          request(app)
          .get('/api/users?id=1')
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.length).to.equal(1);
            done();
          })
        });
      });
    });

    describe('when requesting a single item', () => {
      it('should return an object', (done) => {
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

    describe('when creating an item', () => {
      it('should return an object and persist data', (done) => {
        request(app)
          .post('/api/users')
          .send({
            name: 'Daenerys Targaryen'
          })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.id).to.equal(3);
            expect(res.body.name).to.equal('Daenerys Targaryen');

            request(app)
              .get('/api/users/3')
              .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body.id).to.equal(3);
                expect(res.body.name).to.equal('Daenerys Targaryen');
                done();
              })
          })
      });
    });

    describe('when updating an item', () => {
      it('should return an object and persist data', (done) => {
        request(app)
          .post('/api/users/2')
          .send({
            name: 'Daenerys Targaryen',
            updated: true
          })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.id).to.equal(2);
            expect(res.body.name).to.equal('Daenerys Targaryen');

            request(app)
              .get('/api/users/2')
              .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body.id).to.equal(2);
                expect(res.body.name).to.equal('Daenerys Targaryen');
                expect(res.body.updated).to.equal(true);
                done();
              })
          })
      });
    });
  });

})();