'use strict';

const args = require('optimist').argv;
const path = require('path');

if(process.env.NODE_ENV !== 'test'){
  if(!args.c){
    throw new Error('Specifing a config file is MANDATORY! Use -c flag.');
  }

  if(!args.d){
    throw new Error('Specifing a mock directory is MANDATORY! Use -d flag.');
  }
}
else {
  args.c = path.join(__dirname, '../../spec/config/base.json');
  args.d = path.join(__dirname, '../../spec/mocks/');
}

module.exports = {
  port: args.p || 4000,
  definitionFile: args.c,
  mockDir: args.d,
  user: args.u || false
}