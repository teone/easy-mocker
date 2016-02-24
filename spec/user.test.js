(function () {
  'use strict';

  const chai = require('chai');
  const expect = chai.expect;
  const mockery = require('mockery');
  let userMiddleware;
  const configMock = {
    user: true,
  };

  describe('When provided the -u flag', () => {
    before(() => {
      mockery.enable({
        warnOnReplace: true,
        warnOnUnregistered: false,
        useCleanCache: true,
      });
    });

    before(() => {
      mockery.registerMock('./config', configMock);
      userMiddleware = require('../src/lib/user');
    });

    after(() => {
      mockery.disable();
    });

    describe('the user middleware function', () => {
      it('should add user property to req', () => {
        const req = {
          headers: {
            'x-userid': 'myId',
          },
        };

        userMiddleware(req, {}, () => '');

        expect(req.user).to.equal('myId');
      });
    });
  });
})();
