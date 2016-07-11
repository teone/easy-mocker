(function () {
  'use strict';

  const chai = require('chai');
  const chaiAsPromised = require('chai-as-promised');
  const expect = chai.expect;
  const memory = require('../src/lib/in_memory');
  const path = require('path');

  chai.use(chaiAsPromised);

  describe('The Storage module', () => {

    describe('the getStorage method', () => {

      beforeEach((done) => {
        memory.setStorage({test: []})
        .then(() => {
          done();
        });
      });

      it('should return the memoryStorage', (done) => {
        memory.getStorage()
        .then((storage) => {
          expect(storage).to.deep.equal({test: []});
          done();
        });
      });
    });

    describe('the setStorage method', () => {
      it('should return the memoryStorage', (done) => {
        memory.setStorage({test: []})
        .then((storage) => {
          expect(storage).to.deep.equal({test: []});
          return memory.getStorage();
        })
        .then((storage) => {
          expect(storage).to.deep.equal({test: []});
          done();
        });
      });
    });

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

    describe('the loadBaseData method', () => {
      it('should load data in the memoryStorage', (done) => {
        const mockDir = path.join(__dirname, './mocks/base/');
        memory.loadBaseData(mockDir)
        .then((storage) => {
          // test return
          expect(storage.posts).to.have.lengthOf(2);
          expect(storage.users).to.have.lengthOf(2);
          return memory.getStorage();
        })
        .then((storage) => {
          // test that it has been persisted
          expect(storage.posts).to.have.lengthOf(2);
          expect(storage.users).to.have.lengthOf(2);
          done();
        });
      });
    });
  });

})();
