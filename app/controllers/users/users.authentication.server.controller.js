'use strict';

/**
 * Module dependencies.
 */
var Boom           = require('boom'),
    ErrorHandler   = require('../errors.server.controller');

/**
 * Signup
 */
exports.signup = function (request, reply) {

  var User = request.collections.user;
  // For security measurement we remove the roles from the request.body object
  delete request.payload.roles;

  // Init Variables
  var user = request.payload;

  // Add missing user fields
  user.provider = 'local';
  user.displayName = user.firstName + ' ' + user.lastName;

  // Then save the user
  User.create(user, function (err) {

    if (err) {
      return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
    } else {

      user = user.toJSON();
      request.session.set(request.server.app.sessionName, user);
      reply(user);
    }
  });
};


/**
 * Local Signin
 */
exports.signin = function (request, reply) {

  var User = request.collections.user;

  if (!request.auth.isAuthenticated) {

    var username = request.payload.username;
    var password = request.payload.password;
    if (!username || !password) {
      return reply(Boom.unauthorized('Username and password should not be blank'));
    }

    User.findOne({
      username: username
    }, function (err, user) {

      if (err) {
        return reply(Boom.unauthorized(err));
      }
      if (!user) {
        return reply(Boom.unauthorized('Username or password are wrong'));
      }
      if (!user.authenticate(password)) {
        return reply(Boom.unauthorized('Username or password are wrong'));
      }

      if(user !== {}){
        user = user.toJSON();
        request.session.set(request.server.app.sessionName, user);
        return reply(user);
      }
    });
  } else {
    var user = request.auth.credentials;
    return reply.redirect('/', user);
  }
};

/**
 * Signout
 */
exports.signout = function (request, reply) {

  request.session.clear(request.server.app.sessionName);
  reply.redirect('/');
};

/**
 * OAuth callback
 */
exports.oauthCallback = function (request, reply) {

  if (!request.auth.isAuthenticated) {
    return reply.redirect('/#!/signin');
  }
  request.session.set(request.server.app.sessionName, request.pre.user);
  return reply.redirect('/');
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function (request, providerUserProfile, done) {

  var User = request.collections.user;

  if (!request.session.get(request.server.app.sessionName) &&
      request.auth.isAuthenticated) {

    // Define a search query to find existing user with current provider profile
    var query = 'SELECT * FROM "user" WHERE ('+
      '"provider" = \'' + providerUserProfile.provider + '\' AND '+
      '"providerData"->>\'' + providerUserProfile.providerIdentifierField + '\' = \'' +
      providerUserProfile.providerData[providerUserProfile.providerIdentifierField] +
      '\') OR ("additionalProvidersData"#>>\'{' + providerUserProfile.provider + ',' +
      providerUserProfile.providerIdentifierField + '}\' = \''+
      providerUserProfile.providerData[providerUserProfile.providerIdentifierField]+
      '\') LIMIT 1;';

    User.query(query, function (err, results) {

      if (err) {
        return done(err);
      } else {
        if (!results.rows[0]) {
          var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

          User.findUniqueUsername(possibleUsername, null, function (availableUsername) {

            var user = {
              firstName: providerUserProfile.firstName,
              lastName: providerUserProfile.lastName,
              username: availableUsername,
              displayName: providerUserProfile.displayName,
              email: providerUserProfile.email,
              provider: providerUserProfile.provider,
              providerData: providerUserProfile.providerData
            };

            // And save the user
            User.create(user, function (err, user) {
              user = user.toJSON();
              return done(err, user);
            });
          });
        } else {

          // Remove unwanted data from user
          var user = results.rows[0].toJSON();
          return done(err, user);
        }
      }
    });
  } else {
    // User is already logged in, join the provider data to the existing user
    var AuthUser = request.session.get(request.server.app.sessionName);
    User.findOne({id: AuthUser.id}, function (err, user) {

      // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
      if (user.provider !== providerUserProfile.provider &&
        (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
        // Add the provider data to the additional provider data field
        if (!user.additionalProvidersData) AuthUser.additionalProvidersData = {};
        AuthUser.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

        // And save the user
        User.update({id: user.id}, AuthUser, function (err, user) {

          user = user.toJSON();
          return done(err, user, '/#!/settings/accounts');
        });
      } else {
        user = user.toJSON();
        return done(user);
      }
    });

  }
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function (request, reply) {

  var User = request.collections.user;

  var user = request.session.get(request.server.app.sessionName);
  var provider = request.query.provider;

  if (user && provider) {
    // Delete the additional provider
    if (user.additionalProvidersData[provider]) {
      delete user.additionalProvidersData[provider];
    }

    User.update({id: user.id}, user)
      .exec(function (err, user) {

        if (err) {
          return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
        } else {
          user = user.toJSON();

          request.session.set(request.server.app.sessionName, user);
          return reply(user);
        }
    });
  } else {
    return reply(Boom.badRequest('Invalid provider'));
  }
};
