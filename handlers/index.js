/*
 *
 handlers file
 *
*/
const handlers = {};
const users = require('./users');
const tokens = require('./tokens');
const checks = require('./checks')

// user handlers
handlers.users = users.controller;

// token handler
handlers.tokens = tokens.controller;

// checks handler
handlers.checks = checks.controller;

// 404 handler
handlers.notFound = (req, res) => {
    res({ statusCode: 404,  payload: {
        status: false,
        error: 'Page not found'
    } });
};


module.exports = handlers;
