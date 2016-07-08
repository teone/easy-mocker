(function () {
  'use strict';

  const chai = require('chai');
  const expect = chai.expect;
  const mockery = require('mockery');
  const path = require('path');
  const request = require('supertest');
  let userMiddleware;
  let app;
  let memory;

  describe('When provided the -u flag', () => {
    before(() => {
      mockery.enable({
        warnOnReplace: true,
        warnOnUnregistered: false,
        useCleanCache: true,
      });
    });

    after(() => {
      mockery.disable();
    });

    describe('the user middleware function', () => {
      describe('when using default header field', () => {
        beforeEach(() => {
          mockery.resetCache();
          const configMock = {
            config: {
              user: true,
              definitionFile: path.join(__dirname, './config/base.json'),
            },
          };
          mockery.registerMock('./config', configMock);
          userMiddleware = require('../src/lib/user').userMiddleware;
        });
        afterEach(() => {
          mockery.deregisterMock('./config');
        });
        it('should add user property to req', (done) => {
          const req = {
            headers: {
              'x-userid': 'myId',
            },
          };

          userMiddleware(req, {}, () => '')
          .then(() => {
            expect(req.user).to.equal('myId');
            done();
          });
        });
      });

      describe('when provided a custom header field', () => {
        beforeEach(() => {
          mockery.resetCache();
          const configMock = {
            config: {
              user: true,
              definitionFile: path.join(__dirname, './config/users_enabled.json'),
            },
          };
          mockery.registerMock('./config', configMock);
          userMiddleware = require('../src/lib/user').userMiddleware;
        });
        afterEach(() => {
          mockery.deregisterMock('./config');
        });
        it('should add user property to req', (done) => {
          const req = {
            headers: {
              'x-randomfield': 'myId',
            },
          };

          userMiddleware(req, {}, () => '')
          .then(() => {
            expect(req.user).to.equal('myId');
            done();
          })
          .catch(e => {
            done(e);
          });
        });
      });
    });

    describe('the apis', () => {
      beforeEach((done) => {
        mockery.resetCache();
        const configMock = {
          config: {
            user: true,
            definitionFile: path.join(__dirname, './config/users_enabled.json'),
            mockDir: path.join(__dirname, './mocks/users_enabled/'),
          },
        };
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
      });

      describe('when GET', () => {
        it('should filter data based on userid', (done) => {
          request(app)
            .get('/api/posts')
            .set({'x-randomField': '1'})
            .end((err, res) => {
              expect(res.status).to.equal(200);
              expect(res.body.length).to.equal(2);
              done();
            });
        });

        describe('a single entry', () => {
          it('should not read entries that belongs to other users', (done) => {
            request(app)
              .get('/api/posts/3')
              .set({'x-randomField': '1'})
              .end((err, res) => {
                expect(res.status).to.equal(403);
                expect(res.body.error).to.equal('This is not your stuff! Keep your hands down!');
                done();
              });
          });
        });
      });

      describe('when POST', () => {
        it('should add user field to req.body', (done) => {
          request(app)
            .post('/api/posts')
            .send({title: 'randomTitle'})
            .set({'x-randomField': '1'})
            .end((err, res) => {
              expect(res.status).to.equal(200);
              expect(res.body.user).to.equal(1);
              done();
            });
        });
      });

      describe('when DELETE', () => {
        it('should prevent deleting other users entries', (done) => {
          request(app)
            .delete('/api/posts/3')
            .set({'x-randomField': '1'})
            .end((err, res) => {
              expect(res.status).to.equal(403);
              expect(res.body.error).to.equal('This is not your stuff! Keep your hands down!');
              done();
            });
        });
      });
    });
  });
})();
