/*
 *
 primary file for checks
 *
*/

const _data = require("../lib/data");
const helpers = require("../lib/helpers");

const checks = {};

checks.controller = (req, res) => {
    const acceptedMethods = ["put", "get", "post", "delete"];

    // check if method supported or not
    if (acceptedMethods.indexOf(req.method) > -1) {
        const methodHandler = checks[req.method];

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

checks.post = (req, res) => {
    // accept props: url, method, protocol, successcodes, timeout
    const { phone } = req.query;

    const { authorization } = req.headers;
    const userToken = authorization?.split(" ").pop();

    const payload = helpers.jsonToOject(req.payload);

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

            console.log(typeof payload.methods);

            const url = helpers.input.isValidUrl(payload?.url) ? payload.url.trim() : "";
            const methods = ["get"];
            const protocol = helpers.input.isValidProtocol(payload?.protocol) ? payload.protocol : "";
            const successCodes = helpers.input.isValidInputArray(payload?.successCodes) ? payload.successCodes : "";
            const timeout = helpers.input.isValidTimeout(payload?.timeout) ? payload.timeout : "";

            // check errr after validation
            let inputError = null;

            switch ("") {
                case url:
                    inputError = "Invalid url name";
                    break;

                case protocol:
                    inputError = "Invalid protocol name";
                    break;

                case successCodes:
                    inputError = "Invalid successCodes number";
                    break;

                case timeout:
                    inputError = "Invalid timeout password";
                    break;

                default:
                    inputError = null;
            }

            if (inputError) {
                res({
                    statusCode: 400,
                    payload: {
                        status: false,
                        error: inputError,
                    },
                });

                return;
            }

            const newCheck = {
                id: helpers.createId("ch"),
                url,
                methods,
                protocol,
                successCodes,
                timeout,
            };

            _data.read({
                url: `checks/${phone}.json`,
                callback: (error, data) => {
                    if (error) {
                        res({
                            statusCode: 500,
                            payload: {
                                status: false,
                                error: "Internal server error",
                            },
                        });
                        return;
                    }

                    const oldCheckObject = helpers.jsonToOject(data);

                    if (!oldCheckObject?.checks) {
                        res({
                            statusCode: 500,
                            payload: {
                                status: false,
                                error: "Internal server error",
                            },
                        });
                        return;
                    }

                    if (oldCheckObject?.total >= 5) {
                        res({
                            statusCode: 200,
                            payload: {
                                status: false,
                                error: "Exceed total check amount",
                            },
                        });
                        return;
                    }

                    const newChecksArray = [...oldCheckObject.checks, newCheck];
                    const newCheckObject = {
                        total: newChecksArray.length,
                        checks: newChecksArray,
                    };

                    _data.update({
                        url: `checks/${phone}.json`,
                        data: helpers.objectToJson(newCheckObject),
                        callback: (error) => {
                            if (error) {
                                res({
                                    statusCode: 500,
                                    payload: {
                                        status: false,
                                        error: "Internal server error",
                                    },
                                });
                                return;
                            }

                            res({
                                statusCode: 200,
                                payload: {
                                    status: true,
                                    data: newCheckObject,
                                },
                            });
                        },
                    });
                },
            });
        },
    });
};

checks.get = (req, res) => {
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

            _data.read({
                url: `checks/${phone}.json`,
                callback: (error, data) => {
                    if (error) {
                        res({
                            statusCode: 500,
                            payload: {
                                status: false,
                                error: "Internal server error",
                            },
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
        },
    });
};

checks.put = (req, res) => {
    const { phone } = req.query;

    const { authorization } = req.headers;
    const userToken = authorization?.split(" ")?.pop();

    const payload = helpers.jsonToOject(req.payload);

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

            if (!helpers.input.isValidInputArray(payload?.methods)) {
                res({
                    statusCode: 200,
                    payload: {
                        status: false,
                        error: "Invalid methods.",
                    },
                });
                return;
            }

            if (!payload.checkId) {
                res({
                    statusCode: 200,
                    payload: {
                        status: false,
                        error: "Invalid check id.",
                    },
                });
                return;
            }

            _data.read({
                url: `checks/${phone}.json`,
                callback: (error, data) => {
                    if (error) {
                        res({
                            statusCode: 500,
                            payload: {
                                status: false,
                                error: "Internal server error",
                            },
                        });
                        return;
                    }

                    const oldChecksObj = helpers.jsonToOject(data);
                    const checkToUpdate = oldChecksObj.checks.find((check) => check.id === payload.checkId);

                    if (!checkToUpdate) {
                        res({
                            statusCode: 200,
                            payload: {
                                status: false,
                                error: "Check not found",
                            },
                        });
                        return;
                    }

                    checkToUpdate.methods = payload.methods;

                    _data.update({
                        url: `checks/${phone}.json`,
                        data: helpers.objectToJson(oldChecksObj),
                        callback: (error, data) => {
                            if (error) {
                                res({
                                    statusCode: 500,
                                    payload: {
                                        status: false,
                                        error: "Internal server error",
                                    },
                                });
                                return;
                            }

                            res({
                                statusCode: 200,
                                payload: {
                                    status: true,
                                    data: oldChecksObj,
                                },
                            });
                        },
                    });
                },
            });
        },
    });
};

checks.delete = (req, res) => {
    const { phone } = req.query;

    const { authorization } = req.headers;
    const userToken = authorization?.split(" ")?.pop();

    const payload = helpers.jsonToOject(req.payload);

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

            _data.read({
                url: `checks/${phone}.json`,
                callback: (error, data) => {
                    if (error) {
                        res({
                            statusCode: 500,
                            payload: {
                                status: false,
                                error: "Internal server error",
                            },
                        });
                        return;
                    }

                    const oldCheckObj = helpers.jsonToOject(data);

                    if (oldCheckObj?.checks?.length < 1) {
                        res({
                            statusCode: 200,
                            payload: {
                                status: false,
                                error: "No checks to delete",
                            },
                        });
                        return;
                    }

                    const newCheckArray = oldCheckObj.checks.filter((check) => check?.id !== payload?.checkId);
                    const newCheckObj = {
                        total: newCheckArray.length,
                        checks: newCheckArray,
                    };

                    _data.update({
                        url: `checks/${phone}.json`,
                        data: helpers.objectToJson(newCheckObj),
                        callback: (error, data) => {
                            if (error) {
                                res({
                                    statusCode: 500,
                                    payload: {
                                        status: false,
                                        error: "Internal server error",
                                    },
                                });
                                return;
                            }

                            res({
                                statusCode: 200,
                                payload: {
                                    status: true,
                                    data: newCheckObj,
                                },
                            });
                        },
                    });
                },
            });
        },
    });
};

module.exports = checks;
