# passport-coding-oauth
[Passport](http://passportjs.org/) strategy for authenticating with [Coding](https://Coding.net/) using the OAuth 2.0 API..

This module lets you authenticate using Coding in your Node.js applications.
By plugging into Passport, Coding authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-coding-oauth

## Usage

#### Configure Strategy

The Coding authentication strategy authenticates users using a Coding oauth tokens. The strategy requires a `verify` callback, which accepts
these credentials and calls `done` providing a user, as well as `options`
specifying a client ID, client secret, and callback URL.

    passport.use(new CodingStrategy({
        clientID: CODING_CLIENT_ID,
        clientSecret: CODING_CLIENT_SECRET,
        callbackURL: "http://127.0.0.1:3000/auth/coding/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ codingId: profile.id }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'coding'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/coding',
      passport.authenticate('coding'));

    app.get('/auth/coding/callback', 
      passport.authenticate('coding', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });


## Tests

    $ npm install --dev
    $ npm test


## Credits

  - [villager10086](http://github.com/villager10086)


## License

[The MIT License](http://opensource.org/licenses/MIT)

