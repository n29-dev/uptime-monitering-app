/*
 *
 router file
 *
*/
const handlers = require("../handlers");

const router = {
    ['']: handlers.home,
    'api/users': handlers.users,
    'api/tokens': handlers.tokens,
    'api/checks': handlers.checks,
    
};

module.exports = router;
