# EASY MOCKER

[![Build Status](https://travis-ci.org/teone/easy-mocker.svg?branch=master)](https://travis-ci.org/teone/easy-mocker)

[![NPM](https://nodei.co/npm/easy-mocker.png?downloads=true&downloadRank=true&stars=true)](https://npmjs.org/package/easy-mocker?downloads=true&downloadRank=true&stars=true)

This is a `NodeJs` webserver intended for development. It provides a basic and quick way to define mock response trough a collection of `JSON` responses and a `JSON` file containing endpoint definition.

## Installation

Grab it form npm: `npm install easy-mocker`

Minimum usage: `easy-mocker -c config.json -d folder/`

## Configuration

| Option | Value | Description |
| ------ | ----- | ----------- |
| `-c`*  | `path/to/config.json` | Path to api definition |
| `-d`*  | `path/to/mock-directory` | Path to mock folder |
| `-p`   | `port` | Webserver port |
| `-u`   | `null` | Return different file for different user (to be implemented) |

 _Options marked with * are mandatory.mv m_

## Configuration file

This is a sample structure for a configuration file:

```
[
  {
    "url": "users",
    "base": "api/",
    "methods": ["GET"],
    "param": "id"
  },
  {
    "url": "posts",
    "base": "api/",
    "methods": ["GET", "POST"],
    "param": "id"
  }
]
```

That will generate the following endpoints:

- `GET /api/users`
- `GET /api/users/:id`
- `GET /api/posts`
- `GET /api/posts/:id`
- `POST /api/posts`
- `POST /api/posts/:id`

## MOCK Files

You can provide data to be loaded as a starting point for your development server. They should be located in the Mock Folder directory (`-d` option).

Examples for this files can be found in `spec/mocks`, anyway they are plain `JSON` arrays of objects.

## TODO

- Create and endpont (or command to restore the original data)
- How to handle similar endpoints (`api/user/devices`, `api/other/devices`)? Now thery'll look for the same definition file `devices.json`. Probably adding an optional `filename` to the `config` should work.
- Handle users
- Add config options to allow specify a header different form `x-userid` to identify user
- If `-u` is set create `login` and `logout` endpoint


