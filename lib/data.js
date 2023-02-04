/*
 *
 helpers for reading, writing data to the file system.
 *
*/
const fs = require("node:fs");
const path = require("node:path");

const _data = {};

// setting base url
_data.baseURl = path.join(__dirname, "../.data");

_data.create = ({ url, data, callback }) => {
    fs.writeFile(path.join(_data.baseURl, url), data, { encoding: "utf-8", flag: "wx" }, callback);
};

_data.read = ({ url, callback }) => {
    fs.readFile(path.join(_data.baseURl, url), { encoding: "utf-8" }, callback);
};

_data.update = ({ url, data, callback }) => {
    fs.writeFile(path.join(_data.baseURl, url), data, { encoding: "utf-8", flag: "w" }, callback);
};

_data.delete = ({ url, callback }) => {
    fs.unlink(path.join(_data.baseURl, url), callback);
};

_data.getFilesList = ({url, callback}) => {
    fs.readdir(path.join(_data.baseURl, url), callback);
};

module.exports = _data;
