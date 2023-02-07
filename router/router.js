/*
 *
 router file
 *
*/
const handlers = require("../handlers");

const router = {
    [""]: handlers.home,
    register: handlers.register,
    login: handlers.login,
    "api/users": handlers.users,
    "api/tokens": handlers.tokens,
    "api/checks": handlers.checks,
};

module.exports = router;
