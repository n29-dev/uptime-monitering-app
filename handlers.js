/*
 *
 handlers file
 *
*/

const handlers = {};

// users handler
handlers.users = (data, callback) => {
    callback({
        statusCode: 200,
        payload: JSON.stringify({ name: "nazib" }),
    });
};

// 404 handler
handlers.notFound = (data, callback) => {
    callback({payload: 'Page not found'});
};

module.exports = handlers;
