/**
 * Module dependencies.
 */
var util = require('util')
    , url = require('url')
    , OAuth2Strategy = require('passport-oauth2')
    , InternalOAuthError = require('passport-oauth2').InternalOAuthError;



/**
 * `Strategy` constructor.
 *
 * The Coding.net authentication strategy authenticates requests by delegating to
 * Coding using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Coding application's Client ID
 *   - `clientSecret`  your Coding application's Client Secret
 *   - `callbackURL`   URL to which Coding will redirect the user after granting authorization
 *   - `scope`         array of permission scopes to request. Valid scopes include:
 *                     'user', 'user:email', 'project', 'social', or none.
 *                     (see https://open.coding.net/references/oauth/#2-参数 for more info)
 *
 * Examples:
 *
 *     passport.use(new CodingStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret',
 *         callbackURL: 'https://www.example.net/auth/callback',
 *         userAgent: 'myapp.com'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify){
    options = options || {};
    options.authorizationURL = options.authorizationURL || 'https://coding.net/oauth_authorize.html';
    options.tokenURL = options.tokenURL || 'https://coding.net/api/oauth/access_token';
    options.scopeSeparator = options.scopeSeparator || ',';
    options.customHeaders = options.customHeaders || {};
    if (!options.customHeaders['User-Agent']) {
        options.customHeaders['User-Agent'] = options.userAgent || 'passport-coding';
    }
    options.scope = options.scope || ['user','user:email'];
 
    OAuth2Strategy.call(this, options, verify);
    this.name = options.name || 'coding';

    this._userProfileURL = options.userProfileURL || 'https://coding.net/api/current_user';
    this._userEmailURL = options.userEmailURL || 'https://coding.net/api/account/email';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from Coding.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `coding`
 *   - `id`               the user's Coding  ID
 *   - `username`         the user's Coding username
 *   - `avatar`           the user's avatar link
 *   - `profileUrl`       the URL of the profile for the user on Coding.net
 *   - `emails`           the user's email addresses if you had setted scope to `user:email`
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
    var self = this;

    this._oauth2.get(this._userProfileURL,accessToken,function(err,body,res){
        if(err) return done(new InternalOAuthError('Failed to get current user profile',err));
        var json;
        try{
            json = JSON.parse(body);
        }catch(ex){
            return done(new Error('Failed to parse user profile'));
        }
        if(json.code !== 0){
            var errorMsg = "";
            Object.keys(json.msg).forEach(function(msg_name){
                errorMsg += json.msg[msg_name]+" ";
            });
            return done(new Error(errorMsg));
        }
        var profile = formateUserProfile(json.data);
        profile._raw = body;
        profile._json = json.data;
        //get email
        if(self._scope.indexOf('user:email') !== -1){
            self._oauth2.get(self._userEmailURL,accessToken,function(err,body,res){
                if (err) {
                    return done(new InternalOAuthError('Failed to fetch user emails', err));
                }
                var json;
                try{
                    json = JSON.parse(body);
                }catch(ex){
                    return done(new Error('Failed to parse email'));
                }
                if(json.code !== 0){
                    var errorMsg = "";
                    Object.keys(json.msg).forEach(function(msg_name){
                        errorMsg += json.msg[msg_name]+" ";
                    });
                    return done(new Error(errorMsg));
                }
                profile.email = json.data;
                done(null,profile);
            });
        }else{
            done(null,profile);
        }
    });
}
/**
 * format the Object to profile
 * @param {Object} data 
 */
function formateUserProfile(data){
    var profile = {
        provider:'coding'
    };
    profile.id = data.id
    profile.username = data.name;
    profile.avatar = data.avatar;
    profile.profileUrl = url.resolve('https://coding.net',data.path);
    return profile;
}   


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;