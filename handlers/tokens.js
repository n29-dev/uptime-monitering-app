/*
 *
 primary file for auth tokens
 *
*/
const helpers = require('../lib/helpers');
const _data = require('../lib/data')
const config = require('../config')

const tokens = {};

tokens.controller = (req, res) => {
    const acceptedMethods = ["put"];

    // check if method supported or not
    if (acceptedMethods.indexOf(req.method) > -1) {
        const methodHandler = tokens[req.method];

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

tokens.put = (req, res) => {
    const { phone } = req.query;

    const { authorization } = req.headers;
    const userToken = authorization?.split(" ")?.pop();

    const payload = helpers.jsonToOject(req.payload)

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

    if(!payload?.extend){
        res({
            statusCode: 400,
            payload: {
                status: false,
                error: "Please pass extend=true as body",
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

            const newTokenObj = prevUserData.token;
            newTokenObj.expires = Date.now() + config.authTokenPeriod;

            const updatedUser = { ...prevUserData, token: newTokenObj};

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
                        payload: {
                            status: true
                        },
                    });
                },
            });
        },
    });

}

module.exports = tokens;