(function () {
  'use strict';

  const chai = require('chai');
  const expect = chai.expect;
  const path = require('path');

  describe('The storage helper', () => {

    const memory = require('../src/lib/in_memory');

    const definition = [
      {
        url: 'users',
        methods: ['GET', 'POST'],
        param: 'id'
      },
      {
        url: 'posts',
        methods: ['GET', 'POST'],
        param: 'id'
      }
    ];

    describe('given an API structure', () => {
      it('should build the appropriate storage', () => {
        memory.buildStorage(definition);

        expect(memory.memoryStorage).to.have.property('users');
        expect(memory.memoryStorage).to.have.property('posts');
      });
    });

    describe('given a mocks folder', () => {
      it('should fill the in-memory storage with base data', (done) => {
        memory.loadBaseData(path.join(__dirname, './mocks/'))
        .then(() => {
          expect(memory.memoryStorage).to.have.property('users').with.length(2);
          expect(memory.memoryStorage).to.have.property('posts').with.length(2);
          done();
        });
      });
    });
  });
})();