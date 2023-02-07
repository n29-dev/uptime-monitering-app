/*
 *
 primary file for home
 *
*/
const templater = require("../lib/templater");

const staticHandler = {};

staticHandler.handler = ({ filePath }) => {
    return (req, res) => {
        if (req.method !== "get") {
            res({
                statusCode: 405,
                contentType: "html",
                payload: {
                    status: false,
                    error: "Unsupported http method",
                },
            });
            return;
        }

        templater.getAsset({
            url: filePath,
            callback: (error, data) => {
                if (error) {
                    res({
                        statusCode: 500,
                        contentType: "html",
                    });
                    return;
                }
                res({
                    contentType: "html",
                    payload: data,
                });
            },
        });
    };
};

module.exports = staticHandler;
