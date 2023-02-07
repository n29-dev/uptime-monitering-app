/*
 *
 primary handing public files
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

    const assetPath = req.path.replace("public/", "");
    const assetExt = assetPath.split(".")[1];

    templater.getAsset({
        url: assetPath,
        callback: (error, data) => {
            if (error) {
                res({
                    statusCode: 404,
                    payload: "",
                });
                return;
            }

            res({
                payload: data,
                contentType: assetExt,
            });
        },
    });
};

module.exports = home;
