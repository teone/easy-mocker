(function () {
  'use strict';

  const chai = require('chai');
  const expect = chai.expect;
  const path = require('path');
  const mockery = require('mockery');
  let memory;

  describe('The storage helper', () => {
    const definition = [
      {
        url: 'users',
        methods: ['GET', 'POST'],
        param: 'id',
      },
      {
        url: 'posts',
        methods: ['GET', 'POST'],
        param: 'id',
      },
    ];

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

    describe('given an API structure', () => {
      memory = require('../src/lib/in_memory');
      it('should build the appropriate storage', () => {
        memory.buildStorage(definition);

        expect(memory.memoryStorage).to.have.property('users');
        expect(memory.memoryStorage).to.have.property('posts');
      });
    });

    describe('given a mocks folder', () => {
      memory = require('../src/lib/in_memory');
      it('should fill the in-memory storage with base data', (done) => {
        memory.loadBaseData(path.join(__dirname, './mocks/base/'))
        .then(() => {
          expect(memory.memoryStorage).to.have.property('users').with.length(2);
          expect(memory.memoryStorage).to.have.property('posts').with.length(2);
          done();
        });
      });
    });

    describe('given a full memory storage', () => {

      beforeEach(() => {
        memory.buildStorage(definition);
        memory.memoryStorage.users = ['a', 'b', 'c'];
        memory.memoryStorage.posts = ['d', 'e', 'f'];
        mockery.resetCache();
        const configMock = {
          definitionFile: path.join(__dirname, './config/base.json'),
          mockDir: path.join(__dirname, './mocks/base/'),
        };
        mockery.registerMock('./config', configMock);
        memory = require('../src/lib/in_memory');
      });

      it('should restore the base data', (done) => {
        memory.setup()
        .then(() => {
          expect(memory.memoryStorage).to.have.property('users').with.length(2);
          expect(memory.memoryStorage).to.have.property('posts').with.length(2);
          done();
        })
        .catch((e) => {
          console.log(e);
          done(e);
        });
      });
    });
  });
})();
