'use strict';

const args = require('optimist').argv;

if(!args.c){
  throw new Error('Specifing a config file is MANDATORY! Use -c flag.');
}

if(!args.d){
  throw new Error('Specifing a mock directory is MANDATORY! Use -d flag.');
}

module.exports = {
  port: args.p || 4000,
  definitionFile: args.c,
  mockDir: args.d,
  user: args.u || false
}