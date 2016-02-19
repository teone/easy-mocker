# How to Contribute

Contributions are everytime welcome!

But there are a few rules to follow:

- Code must follow the stileguide. It is enforced trough `eslint` and can be cheched with `npm run lint`. The styleguide followed is [AirBnB](https://github.com/airbnb/javascript) and it is enforce trought EsLint (At the moment a [bug](https://github.com/airbnb/javascript/pull/730) is traced)
- Code must be tested. Libraries used for teting are [Mocha](https://mochajs.org/) and [Chai](http://chaijs.com/) to follow the standard. Test can be runned with `npm test` or `NODE_env=test mocha spec/` (require `mocha` to be installed globally).
- Features should be discussed! (Using [GitHub Issues](https://github.com/teone/easy-mocker/issues))
- A TODO list is added at the end of the `REAME.md` file. It should be a good starting point.