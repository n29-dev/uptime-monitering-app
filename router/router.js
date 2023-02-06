/*
 *
 router file
 *
*/
const handlers = require("../handlers");

const router = {
    ['']: handlers.home,
    users: handlers.users,
    tokens: handlers.tokens,
    checks: handlers.checks,
    
};

module.exports = router;
