var assert = require('assert');
var url = require('url');
var CodingStrategy = require('../lib/strategy');
var InternalOAuthError = require('passport-oauth2').InternalOAuthError;

describe('strategy', function () {
    var strategy = new CodingStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
    },
        function () { });

    it("strategy's name should be coding", function () {
        assert.equal(strategy.name, 'coding');
    })

    it('strategy\'s  default user agent should be passport-coding', function () {
        assert.equal(strategy._oauth2._customHeaders['User-Agent'], 'passport-coding');
    });

    describe('custom strategy test include custom header, custom user agent', function () {
        describe('constructed with user agent option', function () {
            var strategy = new CodingStrategy({
                clientID: 'ABC123',
                clientSecret: 'secret',
                userAgent: 'example.com'
            },
                function () { });

            it('custom strategy should have custom user agent', function () {
                assert.equal(strategy._oauth2._customHeaders['User-Agent'], 'example.com');
            });
        });

        describe('constructed with custom headers including user agent', function () {
            var strategy = new CodingStrategy({
                clientID: 'ABC123',
                clientSecret: 'secret',
                customHeaders: { 'User-Agent': 'example.com' }
            },
                function () { });

            it('custom strategy should have custom user agent', function () {
                assert.equal(strategy._oauth2._customHeaders['User-Agent'], 'example.com');
            });
        });

        describe('constructed with both custom headers including user agent and user agent option', function () {
            var strategy = new CodingStrategy({
                clientID: 'ABC123',
                clientSecret: 'secret',
                customHeaders: { 'User-Agent': 'example.org' },
                userAgent: 'example.net'
            },
                function () { });

            it('custom strategy should have custom user agent', function () {
                assert.equal(strategy._oauth2._customHeaders['User-Agent'], 'example.org');
            });
        });
    });

    describe('strategy\'s profile test', function () {
        var strategy = new CodingStrategy({
            clientID: 'ABC123',
            clientSecret: 'secret',
            scope:['user']
        },
            function () { });

        it('should return a profile object', function () {
            strategy._oauth2.get = function (url, accessToken, callback) {
                var body = '{"code": 0, "data":{ "provider": "coding","id": 1,"name": "test","avatar": "avatar_url","path": "profile_url","others":"others"}}';
                callback(null, body, undefined);
            }
            strategy.userProfile('access-token', function (err, profile) {
                assert.equal(err, null);
                assert.equal(typeof (profile), 'object');
                assert.equal(typeof (profile._json), 'object');
                assert.equal(typeof (profile._raw), 'string');
                assert.equal(profile.id, 1);
                assert.equal(profile.username, 'test');
                assert.equal(profile.avatar, 'avatar_url');
                assert.equal(profile.profileUrl, url.resolve('https://coding.net/', 'profile_url'));
            });

        })

        it('throw error when some error happened', function () {
            strategy._oauth2.get = function (url, accessToken, callback) {
                callback(new Error('test error'));
            }
            strategy.userProfile('access-token', function (err, profile) {
                if(err) assert.equal(err instanceof InternalOAuthError,true);
            })
        });
    });

});