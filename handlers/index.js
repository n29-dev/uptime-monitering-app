/*
 *
 handlers file
 *
*/
const handlers = {};
const users = require('./users');

// user handlers
handlers.users = users.controller;

// 404 handler
handlers.notFound = (req, res) => {
    res({ statusCode: 404,  payload: {
        status: false,
        error: 'Page not found'
    } });
};


module.exports = handlers;
