(function () {
  'use strict';

  const request = require('supertest');
  const chai = require('chai');
  const expect = chai.expect;
  const mockery = require('mockery');
  const path = require('path');
  let memory;
  let app;

  describe('From the base config', () => {
    beforeEach((done) => {
      mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false,
        useCleanCache: true,
      });
      mockery.resetCache();
      const configMock = {
        user: false,
        definitionFile: path.join(__dirname, './config/base.json'),
        mockDir: path.join(__dirname, './mocks/base/'),
      };
      mockery.registerMock('./lib/config', configMock);
      mockery.registerMock('./config', configMock);
      app = require('../src/server');
      memory = require('../src/lib/in_memory');
      memory.setup()
      .then(() => {
        done();
      });
    });

    afterEach(() => {
      mockery.deregisterMock('./config');
      mockery.disable();
    });

    describe('when quering items', () => {
      it('should return an array', (done) => {
        request(app)
          .get('/api/users')
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.length).to.equal(2);
            done();
          });
      });

      describe('and query parameters are passed', () => {
        it('should filter result', (done) => {
          request(app)
          .get('/api/users?id=1')
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.length).to.equal(1);
            done();
          });
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
          });
      });
    });

    describe('when creating an item', () => {
      it('should return an object and persist data', (done) => {
        request(app)
          .post('/api/users')
          .send({
            name: 'Daenerys Targaryen',
          })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.id).to.equal(3);
            expect(res.body.name).to.equal('Daenerys Targaryen');

            request(app)
              .get('/api/users/3')
              .end((err1, res1) => {
                expect(res1.status).to.equal(200);
                expect(res1.body.id).to.equal(3);
                expect(res1.body.name).to.equal('Daenerys Targaryen');
                done();
              });
          });
      });

      describe('in an empty collection', () => {
        it('should return an object and persist data', (done) => {
          request(app)
            .post('/api/empty')
            .send({
              title: 'Sample Title',
            })
            .end((err, res) => {
              expect(res.status).to.equal(200);
              expect(res.body.id).to.equal(1);
              expect(res.body.title).to.equal('Sample Title');

              request(app)
                .get('/api/empty/1')
                .end((err1, res1) => {
                  expect(res1.status).to.equal(200);
                  expect(res1.body.title).to.equal('Sample Title');
                  done();
                });
            });
        });
      });
    });

    describe('when updating an item', () => {
      it('should return an object and persist data', (done) => {
        request(app)
          .post('/api/users/2')
          .send({
            name: 'Daenerys Targaryen',
            updated: true,
          })
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.id).to.equal(2);
            expect(res.body.name).to.equal('Daenerys Targaryen');

            request(app)
              .get('/api/users/2')
              .end((err1, res1) => {
                expect(res1.status).to.equal(200);
                expect(res1.body.id).to.equal(2);
                expect(res1.body.name).to.equal('Daenerys Targaryen');
                expect(res1.body.updated).to.equal(true);
                done();
              });
          });
      });
    });

    describe('when deleting an item', () => {
      it('should return 204 and remove item', (done) => {
        request(app)
          .delete('/api/users/1')
          .end((err, res) => {
            expect(res.status).to.equal(204);
            expect(memory.memoryStorage.users.length).to.equal(1);
            expect(memory.memoryStorage.users[0].id).to.equal(2);
            done();
          });
      });
    });
  });

  describe('From the Missing Endpoint config', () => {
    beforeEach(() => {
      mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false,
        useCleanCache: true,
      });
      mockery.resetCache();
      const configMock = {
        user: false,
        definitionFile: path.join(__dirname, './config/missing-endpoint.json'),
        mockDir: path.join(__dirname, './mocks/base/'),
      };
      mockery.registerMock('./lib/config', configMock);
      mockery.registerMock('./config', configMock);

      memory = require('../src/lib/in_memory');
    });

    it('should throw an error', (done) => {
      memory.setup()
      .then(() => {
        // if doesn't reject the test should fail
        expect(true).to.equal(false);
        done();
      })
      .catch(() => {
        expect(true).to.equal(true);
        done();
      });
    });

    afterEach(() => {
      mockery.deregisterMock('./config');
      mockery.disable();
    });
  });
})();
