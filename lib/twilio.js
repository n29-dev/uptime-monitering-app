/*
 *
 primary for twilio api
 *
*/
const config = require("../config");
const https = require("node:https");
const queryString = require("node:querystring");
const twilio = {};

twilio.sendSms = ({ payload, callback }) => {
    if (!payload.to || !payload.body) {
        callback({
            error: true,
            message: "Invalid payload",
        });
        return;
    }


    const smsData = queryString.stringify({
        From: config.twilio.number,
        To: payload.to,
        Body: payload.body,
    });

    const reqObj = {
        protocol: "https:",
        hostname: "api.twilio.com",
        method: "post",
        path: `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
        auth: `${config.twilio.accountSid}:${config.twilio.authToken}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            "Content-Length": Buffer.byteLength(smsData),
        },
    };

    const req = https.request(reqObj, (res) => {
        const { statusCode } = res;

        if (statusCode === 200 || statusCode === 201) {
            callback({
                success: true,
            });
        } else {
            callback({
                error: true,
                message: `Failed with ${statusCode} statuscode`,
            });
        }
    });

    req.write(smsData);

    req.on("error", (error) => {
        callback({
            error: true,
            message: error?.message,
        });
    });
};

module.exports = twilio;
