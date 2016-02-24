(function () {
  'use strict';

  const chai = require('chai');
  const expect = chai.expect;
  const mockery = require('mockery');
  const path = require('path');
  let userMiddleware;

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
            user: true,
            definitionFile: path.join(__dirname, './config/base.json'),
          };
          mockery.registerMock('./config', configMock);
          userMiddleware = require('../src/lib/user');
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
            user: true,
            definitionFile: path.join(__dirname, './config/users_enabled.json'),
          };
          mockery.registerMock('./config', configMock);
          userMiddleware = require('../src/lib/user');
        });
        afterEach(() => {
          mockery.deregisterMock('./config');
        });
        it('should add user property to req', (done) => {
          const req = {
            headers: {
              'x-randomField': 'myId',
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
  });
})();
