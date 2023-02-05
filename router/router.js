/*
 *
 router file
 *
*/
const handlers = require("../handlers");

const router = {
    users: handlers.users,
    tokens: handlers.tokens,
    checks: handlers.checks,
    
};

module.exports = router;