(function () {
  'use strict';

  const request = require('supertest');
  const chai = require('chai');
  const expect = chai.expect;
  const path = require('path');

  let app;

  // SPIED METHODS
  const config = require('../src/lib/config');

  describe('The generated API endpoints', () => {

    beforeEach((done) => {
      // set the config we want to read
      config.config.definitionFile = path.join(__dirname, './config/base.json');
      config.config.mockDir = path.join(__dirname, './mocks/base/');

      app = require('../src/server');

      // wait for server to be loaded
      // TODO find a better way
      setTimeout(() => {
        done();
      }, 300);
    });

    xit('should have a GET method', () => {
      // expect(config.readConfig).to.have.been.called;
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
            expect(res.body.updated).to.equal(true);

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
            done();
            // memory.getStorage()
            // .then((storage) => {
            //   expect(storage.users.length).to.equal(1);
            //   expect(storage.users[0].id).to.equal(2);
            //   done();
            // });
          });
      });
    });

  });

})();
