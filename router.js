/*
 *
 router file
 *
*/
const handlers = require("./handlers");

const router = {
    users: handlers.users,
    tokens: handlers.tokens
};

module.exports = router;
