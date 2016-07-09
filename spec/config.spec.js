(function () {
  'use strict';

  const chai = require('chai');
  const chaiAsPromised = require('chai-as-promised');
  const expect = chai.expect;
  const path = require('path');
  const config = require('../src/lib/config');

  chai.use(chaiAsPromised);

  describe('The Config module', () => {
    it('should load the defined configuration', (done) => {
      config.config.definitionFile = path.join(__dirname, './config/base.json');
      config.readConfig()
      .then(cfg => {
        expect(cfg).to.have.property('endpoints');
        expect(cfg.endpoints).to.have.lengthOf(3);
        done();
      });
    });

    it('should load the defined configuration as promised', () => {
      config.config.definitionFile = path.join(__dirname, './config/base.json');
      const p = config.readConfig();
      return expect(p).to.eventually.have.property('endpoints');
    });

    it('should throw an error if no endpoints are specifyed', () => {
      config.config.definitionFile = path.join(__dirname, './config/missing-endpoint.json');
      const p = config.readConfig();
      return expect(p).to.eventually.be.rejected;
    });
  });

})();
