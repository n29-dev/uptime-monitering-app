/*
 *
 library for templating
 *
*/
const path = require("node:path");
const fs = require("node:fs");

const templater = {};

templater.assetsBaseDir = path.join(__dirname, "../public");

templater.getAsset = ({ url, callback }) => {
    fs.readFile(path.join(templater.assetsBaseDir, url), callback);
};


module.exports = templater;
