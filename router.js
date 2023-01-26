/*
 *
 router file
 *
*/
const handlers = require('./handlers');

const router = {
    users: handlers.users,
}

module.exports = router;