# MOCK SERVER

This is `NodeJs` webserver intended for development. It provide a basic and quick way to define mock response trough a collection of `JSON` responses and a `JSON` file containing endpoint definition.

## Configuration

 - `-c path/to/config.json`
 | Option | Value | Description |
 | ------ | ----- | ----------- |
 | `-c`*  | `path/to/config.json` | Path to api definition |
 | `-d`*  | `path/to/mock-directory` | Path to mock folder |
 | `-p`   | `port` | Webserver port |
 | `-u`   | `null` | Return different file for different user |

 _Options marked with * are mandatory.mv m_

## Configuration file

This is a sample structure for a configuration file:

```
[
  {
    "url": "users",
    "methods": ["GET"],
    "param": "id"
  },
  {
    "url": "posts",
    "methods": ["GET", "POST"],
    "param": "id"
  }
]
```

That will generate the following endpoints, note that all endpoint will be prefixed bi `/api`:

- `GET /api/users`
- `GET /api/users/:id`
- `GET /api/posts`
- `GET /api/posts/:id`
- `POST /api/posts`
- `POST /api/posts/:id`

## MOCK Files

Mock files are intended to be named accordingly this rules, and to be stored in the root of provided `mock-directory`. Examples refers to `users` endpoint:

- Prefix the name with method: `GET_users.json`
- If `param` is defined in endpoint configuration it is appended to filename, so that: `GET /users/1` will load `GET_users_1.json`

### Handle Users

If the `-u` flag is set, `mock-server` will search in `req.headers` for an header defining the user id: `x-userid`. Remember to set it.

The `mock-directory` should change in this way:

```
+-- user1
|   +-- mock files for user 1
+-- user2
|   +-- mock files for user 2
+-- userN
    +-- mock files for user N
```

Files inside `user[id]` folders follow normal mock files rules.


