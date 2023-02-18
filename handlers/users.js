/*
 *
 handlers file
 *
*/

const _data = require("../lib/data");
const helpers = require("../lib/helpers");
const config = require("../config");

const users = {};

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

    const vFirstName = helpers.input.isValidNameFormat(firstName) ? firstName.trim() : "";
    const vLastName = helpers.input.isValidNameFormat(lastName) ? lastName.trim() : "";
    const vEmail = helpers.input.isValidEmailFormat(email) ? email.trim() : "";
    const vPhone = helpers.input.isValidPhoneFormat(phone) ? phone.trim() : "";
    const VPassword = helpers.input.isValidPasswordFormat(password) ? helpers.hash(password) : "";

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
            expires: Date.now() + config.authTokenPeriod,
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

            _data.create({
                url: `checks/${phone}.json`,
                data: helpers.objectToJson({
                    total: 0,
                    checks: [],
                }),
                callback: (error, data) => {
                    if (error) {
                        res({
                            statusCode: 500,
                            payload: {
                                status: false,
                                error: "Inernval server error",
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
                console.log("triggered");
                res({
                    statusCode: 400,
                    payload: tokenStatus,
                });
                return;
            }

            res({
                statusCode: 200,
                payload: {
                    status: true,
                    data: helpers.jsonToOject(data),
                },
            });
        },
    });
};

// update user
users.put = (req, res) => {
    const { phone: phoneQuery } = req.query;
    const payload = helpers.jsonToOject(req.payload);

    const { authorization } = req.headers;
    const userToken = authorization?.split(" ")?.pop();

    // phone number not found
    if (!phoneQuery || phoneQuery.length < 11) {
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
    if (!Object.keys(payload).length) {
        res({
            statusCode: 400,
            payload: {
                status: false,
                error: "Invalid update props",
            },
        });
        return;
    }

    const payloadObj = helpers.jsonToOject(req.payload);

    const firstName = helpers.isUndefined(payloadObj.firstName)
        ? undefined
        : helpers.input.isValidNameFormat(payloadObj.firstName)
        ? payloadObj.firstName.trim()
        : "";
    const lastName = helpers.isUndefined(payloadObj.lastName)
        ? undefined
        : helpers.input.isValidNameFormat(payloadObj.lastName)
        ? payloadObj.lastName.trim()
        : "";
    const email = helpers.isUndefined(payloadObj.email)
        ? undefined
        : helpers.input.isValidEmailFormat(payloadObj.email)
        ? payloadObj.email.trim()
        : "";
    const password = helpers.isUndefined(payloadObj.password)
        ? undefined
        : helpers.input.isValidPasswordFormat(payloadObj.password)
        ? helpers.hash(payloadObj.password)
        : "";

    switch ("") {
        case firstName:
            error = "Invalid first name";
            break;

        case lastName:
            error = "Invalid last name";
            break;

        case email:
            error = "Invalid email name";
            break;

        case password:
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

    const createFilteredUpdateProps = (obj) => {
        let filteredObj = {};
        Object.entries(obj)
            .filter(([key, value]) => value !== undefined)
            .forEach(([key, value]) => (filteredObj[key] = value));
        return filteredObj;
    };

    const filteredUpdateProps = createFilteredUpdateProps({ firstName, lastName, email, password });

    _data.read({
        url: `users/${phoneQuery}.json`,
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

            const updatedUser = { ...prevUserData, ...filteredUpdateProps };

            _data.update({
                url: `users/${phoneQuery}.json`,
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
                        payload: {
                            status: true,
                            data: updatedUser,
                        },
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

    _data.read({
        url: `users/${phone}.json`,
        callback: (error, data) => {
            if (error) {
                console.log(phone);
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

                    _data.delete({
                        url: `checks/${phone}.json`,
                        callback: (error) => {
                            if (error) {
                                res({
                                    statusCode: 500,
                                    payload: {
                                        status: false,
                                        error: "Internal Server Error",
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
                },
            });
        },
    });
};

module.exports = users;
