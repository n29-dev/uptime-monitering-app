/*
 *
 handlers file
 *
*/

const _data = require("./lib/data");
const helpers = require("./lib/helpers");

const handlers = {};

// users handler
handlers.users = (req, res) => {
    const acceptedMethods = ["get", "post", "put", "delete"];

    // check if method supported or not
    if (acceptedMethods.indexOf(req.method) > -1) {
        const methodHandler = handlers._users[req.method];

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

// user methods
handlers._users = {};

// add user
handlers._users.post = (req, res) => {
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

    // write user to filesystem
    const user = {
        firstName: vFirstName,
        lastName: vLastName,
        email: vEmail,
        phone: vPhone,
        password: VPassword,
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
handlers._users.get = (req, res) => {
    const { phone } = req.query;

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
handlers._users.put = (req, res) => {
    const { phone } = req.query;
    const payload = helpers.jsonToOject(req.payload);

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

            const updatedUser = {...helpers.jsonToOject(data), ...payload};
            
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

// 404 handler
handlers.notFound = (req, res) => {
    res({ payload: "Page not found" });
};

module.exports = handlers;
