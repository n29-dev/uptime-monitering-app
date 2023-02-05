/*
 *
 Entry file for the booting required apps
 *
*/
const fs = require("node:fs");
const path = require("node:path");

const boot = {};

boot.requiredDirs = [".data", ".data/checks", ".data/users", ".archeive", ".log"];

boot.createDirs = (folders) => {
    folders.forEach((folder) => {
        fs.access(path.join(__dirname, folder), fs.constants.F_OK, (error) => {
            if (error) {
                return;
            }

            fs.mkdir(path.join(__dirname, folder), { recursive: true }, (error) => {
                if (error) {
                    console.log(`Error while creating folder ${folder}`);
                }
            });
        });
    });
};

boot.init = () => {
    boot.createDirs(boot.requiredDirs);
};

module.exports = boot;
