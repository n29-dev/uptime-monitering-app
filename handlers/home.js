/*
 *
 primary file for home
 *
*/
const templater = require("../lib/templater");

const home = {};

home.get = (req, res) => {
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
        url: "index.html",
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

module.exports = home;
