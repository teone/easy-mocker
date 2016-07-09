(function () {
  'use strict';

  const chai = require('chai');
  const chaiAsPromised = require('chai-as-promised');
  const expect = chai.expect;
  const memory = require('../src/lib/in_memory');

  chai.use(chaiAsPromised);

  describe('The Storage module', () => {
    describe('the buildStorage method', () => {

      beforeEach((done) => {
        memory.setStorage({})
        .then(() => {
          done();
        });
      });

      describe('when called with the correct endpoints', () => {

        const endpointsMock = [
          {
            url: 'users',
            base: 'api/',
            methods: ['GET', 'POST', 'DELETE'],
            param: 'id',
          },
          {
            url: 'posts',
            base: 'api/',
            methods: ['GET', 'POST', 'DELETE'],
            param: 'id',
          },
        ];

        it('should create the object structure to create data', (done) => {
          memory.buildStorage(endpointsMock)
          .then((storage) => {
            expect(storage).to.have.property('users');
            expect(storage).to.have.property('posts');
            return memory.getStorage();
          })
          .then((memoryStorage) => {
            expect(memoryStorage).to.have.property('users');
            expect(memoryStorage).to.have.property('posts');
            done();
          });
        });
      });

      describe('when called with wrong endpoints', () => {

        const endpointsMock = [
          {
            something: 'that',
            do: 'not',
            make: 'sense',
          },
        ];

        it('should create the object structure to create data', () => {
          const p = memory.buildStorage(endpointsMock);
          return expect(p).to.eventually.be.rejected;
        });
      });
    });
  });

})();
