'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	Boom = require('boom'),
	Mongoose = require('mongoose'),
	User = Mongoose.model('User');

/**
 * User middleware
 */
exports.userByID = function(request, reply) {

	var id = request.param.id;
	User.findById(id).exec(function(err, user) {
		if (err) return reply(err);
		if (!user) return reply(new Error('Failed to load User ' + id));
		request.profile = user;
		reply.continue();
	});
};

/**
 * Require login routing middleware
 */
exports.requiresLogin = function(request, reply) {

	if (!request.session.get('login')) {
		return reply(Boom.unauthorized('User is not logged in'));
	}
	reply();
};

/**
 * User authorizations routing middleware
 */
exports.hasAuthorization = function(roles) {
	var _this = this;

	return function(request, reply) {
		_this.requireplyLogin(request, reply, function() {
			if (_.intersection(request.payload.user.roles, roles).length) {
				return reply.continue();
			} else {
				return reply(Boom.forbidden('User is not authorized'));
			}
		});
	};
};
