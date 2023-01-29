/*
 *
 handlers file
 *
*/

const _data = require("../lib/data");
const helpers = require("../lib/helpers");

const users = {};

const WEEK_IN_MILI_SEC = 1000 * 60 * 60 * 24 * 7;

// users handler
users.controller = (req, res) => {
    const acceptedMethods = ["get", "post", "put", "delete"];

    // check if method supported or not
    if (acceptedMethods.indexOf(req.method) > -1) {
        const methodHandler = users[req.method];

        methodHandler(req, res);
    } else {
        callback({
            statusCode: 405,
            payload: {
                status: false,
                error: "Unsupported http method",
            },
        });
    }
};

// add user
users.post = (req, res) => {
    const { firstName, lastName, email, phone, password } = helpers.jsonToOject(req.payload);

    const vFirstName = typeof firstName === "string" && firstName?.trim()?.length > 0 ? firstName : "";
    const vLastName = typeof lastName === "string" && lastName?.trim()?.length > 0 ? lastName : "";
    const vEmail = typeof email === "string" && email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g) !== null ? email : "";
    const vPhone = typeof phone === "string" && phone.trim().length === 11 ? phone : "";
    const VPassword = typeof password === "string" && password.trim().length >= 8 ? helpers.hash(password) : "";

    // check errr after validation
    let error = null;

    switch ("") {
        case vFirstName:
            error = "Invalid first name";
            break;

        case vLastName:
            error = "Invalid last name";
            break;

        case vEmail:
            error = "Invalid email name";
            break;

        case vPhone:
            error = "Invalid phone number";
            break;

        case VPassword:
            error = "Invalid password";
            break;

        default:
            error = null;
    }

    if (error) {
        res({
            statusCode: 400,
            payload: {
                status: false,
                error,
            },
        });

        return;
    }

    const tokenKey = helpers.createToken();

    if (!tokenKey) {
        res({
            statusCode: 500,
            payload: {
                staus: false,
                error: "Error generating token",
            },
        });

        return;
    }

    // write user to filesystem
    const user = {
        firstName: vFirstName,
        lastName: vLastName,
        email: vEmail,
        phone: vPhone,
        password: VPassword,
        token: {
            key: tokenKey,
            expires: Date.now() + WEEK_IN_MILI_SEC,
        },
    };

    _data.create({
        url: `/users/${vPhone}.json`,
        data: helpers.objectToJson(user),
        callback: (error) => {
            // phone number already exists
            if (error) {
                res({
                    statusCode: 200,
                    payload: {
                        status: false,
                        error: "Phone number already exists",
                    },
                });

                return;
            }

            // delete passwork and token exprie from response
            delete user.password;
            delete user.token.expires;

            res({
                statusCode: 200,
                payload: {
                    status: true,
                    data: user,
                },
            });
        },
    });
};

// get user
users.get = (req, res) => {
    const { phone } = req.query;

    const { authorization } = req.headers;
    const userToken = authorization?.split(" ")?.pop();

    if (!phone || phone.length < 11) {
        res({
            statusCode: 200,
            payload: {
                status: false,
                error: "Invalid phone number",
            },
        });
        return;
    }

    if (!userToken) {
        res({
            statusCode: 400,
            payload: {
                status: false,
                error: "Please provide auth token",
            },
        });
        return;
    }

    _data.read({
        url: `users/${phone}.json`,
        callback: (error, data) => {
            if (error) {
                res({
                    statusCode: 200,
                    payload: {
                        status: false,
                        error: "User does not exist",
                    },
                });
                return;
            }

            // stored token
            const storedToken = helpers.jsonToOject(data).token;
            const tokenStatus = helpers.validateToken(userToken, storedToken);

            if (!tokenStatus.status) {
                res({
                    statusCode: 400,
                    payload: tokenStatus,
                });
                return;
            }

            res({
                statusCode: 200,
                payload: {
                    status: false,
                    data,
                },
            });
        },
    });
};

// update user
users.put = (req, res) => {
    const { phone } = req.query;
    const payload = helpers.jsonToOject(req.payload);

    const { authorization } = req.headers;
    const userToken = authorization?.split(" ")?.pop();

    // phone number not found
    if (!phone || phone.length < 11) {
        res({
            statusCode: 200,
            payload: {
                status: false,
                error: "Invalid phone number",
            },
        });
        return;
    }

    if (!userToken) {
        res({
            statusCode: 400,
            payload: {
                status: false,
                error: "Please provide auth token",
            },
        });
        return;
    }

    // paylod not found
    if (!payload) {
        res({
            statusCode: 400,
            payload: {
                status: false,
                error: "Invalid update props",
            },
        });
        return;
    }

    _data.read({
        url: `users/${phone}.json`,
        callback: (error, data) => {
            if (error) {
                res({
                    statusCode: 200,
                    payload: {
                        status: false,
                        error: "User does not exist",
                    },
                });
                return;
            }

            const prevUserData = helpers.jsonToOject(data);

            const storedToken = prevUserData.token;
            const tokenStatus = helpers.validateToken(userToken, storedToken);

            if (!tokenStatus.status) {
                res({
                    statusCode: 400,
                    payload: tokenStatus,
                });
                return;
            }

            const updatedUser = { ...prevUserData, ...payload };

            _data.update({
                url: `users/${phone}.json`,
                data: helpers.objectToJson(updatedUser),
                callback: (error) => {
                    if (error) {
                        res({
                            statusCode: 500,
                            payload: {
                                status: false,
                                error: "Error while updating user data",
                            },
                        });
                        return;
                    }

                    res({
                        statusCode: 200,
                        payload: updatedUser,
                    });
                },
            });
        },
    });
};

// delete user
users.delete = (req, res) => {
    const { phone } = req.query;

    const { authorization } = req.headers;
    const userToken = authorization?.split(" ")?.pop();

    // phone number not found
    if (!phone || phone.length < 11) {
        res({
            statusCode: 200,
            payload: {
                status: false,
                error: "Invalid phone number",
            },
        });
        return;
    }

    if (!userToken) {
        res({
            statusCode: 400,
            payload: {
                status: false,
                error: "Please provide auth token",
            },
        });
        return;
    }

    _data.read({url: `users/${phone}.json`, callback: (error, data) => {
        if (error) {
            res({
                statusCode: 200,
                payload: {
                    status: false,
                    error: "User does not exist",
                },
            });
            return;
        }

        // stored token
        const storedToken = helpers.jsonToOject(data).token;
        const tokenStatus = helpers.validateToken(userToken, storedToken);

        if (!tokenStatus.status) {
            res({
                statusCode: 400,
                payload: tokenStatus,
            });
            return;
        }

        _data.delete({
            url: `users/${phone}.json`,
            callback: (error) => {
                if (error) {
                    res({
                        statusCode: 200,
                        payload: {
                            status: false,
                            error: "User does not exist",
                        },
                    });
                    return;
                }
    
                res({
                    statusCode: 200,
                    payload: {
                        status: true,
                        data: "User sucessfully deleted",
                    },
                });
            },
        });
    }})

    
};

module.exports = users;
