/*
 *
 Entry file for background checks
 *
*/
const _data = require("./lib//data");
const helpers = require("./lib/helpers");
const url = require("node:url");
const http = require("node:http");
const https = require("node:https");
const twilo = require("./lib/twilio");

const worker = {};

worker.updateCheckState = (filename, checkId, newState) => {
    _data.read({
        url: `checks/${filename}`,
        callback: (error, data) => {
            if (error) {
                console.log("error while readaing check state");
                return;
            } else {
                const checkData = helpers.jsonToOject(data);
                const checksArray = checkData.checks;

                const failedCheck = checksArray.find((cObj) => cObj.id === checkId);
                failedCheck.state = newState;

                _data.update({
                    url: `checks/${filename}`,
                    data: helpers.objectToJson(checkData),
                    callback: (error) => {
                        if (error) {
                            console.log("error while updating check state");
                            return;
                        }
                    },
                });
            }
        },
    });
};

worker.informCheckFail = (reqObj, errorObj) => {
    twilo.sendSms({
        payload: {
            to: "+8801734016309",
            body: `{SERVER DOWN} ${errorObj.message} --> {URL}: ${reqObj.hostname} | {Method}: ${reqObj.method} | {Time}: ${errorObj.time}`,
        },

        callback: (smsError) => console.log(smsError),
    });
};

worker.performCheck = ({ reqOptions, callback, validStatusCodes }) => {
    let requestModule = http;
    let statusIsReported = false;

    if (reqOptions.protocol === "https:") {
        requestModule = https;
    }

    const req = requestModule.request(reqOptions, (res) => {
        req.removeAllListeners('timeout');

        const { statusCode } = res;

        if (validStatusCodes.indexOf(statusCode) < 0) {
            if (!statusIsReported) {
                statusIsReported = true;
                console.log("Does not meet valid status codes");

                callback({
                    error: true,
                    message: `Got back response code ${statusCode}`,
                    time: Date.now(),
                });
            }
        }
    });

    req.end();

    req.on("timeout", () => {
        if (!statusIsReported) {
            statusIsReported = true;
            console.log("request timeout");

            callback({
                error: true,
                message: "request timeout",
                time: new Date(),
            });
        }
    });

    req.on("error", (error) => {
        if (!statusIsReported) {
            statusIsReported = true;
            console.log(error);

            callback({
                error: true,
                message: error?.message,
                time: Date.now(),
            });
        }
    });

};

worker.getSingleCheckObj = (checkObj, from) => {
    const { hostname, protocol, path } = url.parse(`${checkObj.protocol}://${checkObj.url}`);
    const headers = { "Content-Type": "*" };
    const reqObj = { hostname, protocol, path, timeout: checkObj.timeout * 1000, headers };

    checkObj.methods.forEach((method) => {
        const newReqObj = { ...reqObj, method };

        worker.performCheck({
            reqOptions: newReqObj,
            validStatusCodes: checkObj.successCodes,
            callback: (errorObj) => {
                if (errorObj.error) {
                    worker.informCheckFail({...reqObj, method}, errorObj);
                    worker.updateCheckState(from, checkObj.id, "down");
                } else if (checkObj.state === "down") {
                    worker.updateCheckState(from, checkObj.id, "up");
                }
            },
        });
    });
};

worker.getSingleCheckFile = (fileName) => {
    _data.read({
        url: `checks/${fileName}`,
        callback: (error, data) => {
            if (error) {
                console.log(error);
                return;
            }

            const checksData = helpers.jsonToOject(data);

            checksData.checks.forEach((checkObj) => {
                worker.getSingleCheckObj(checkObj, fileName);
            });
        },
    });
};

worker.getAllChecks = () => {
    _data.getFilesList({
        url: "checks",
        callback: (error, data) => {
            if (error) {
                console.log(error);
                return;
            }

            data.forEach((fileName) => {
                worker.getSingleCheckFile(fileName);
            });
        },
    });
};

worker.init = () => {
    setInterval(worker.getAllChecks, 3000)
};

module.exports = worker;
