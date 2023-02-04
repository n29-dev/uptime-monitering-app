/*
 *
 primary for logs
 *
*/
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const _log = {};

_log.baseDir = path.join(__dirname, "../.log");

_log.append = ({ url, data }) => {
    fs.open(path.join(_log.baseDir, url), "a", (error, fd) => {
        if (error) {
            console.log("Error while opening log file");
            return;
        }

        fs.appendFile(fd, `${data} \n`, (error) => {
            if (error) {
                console.log("Error while appending to log file");
                return;
            }

            fs.close(fd, (error) => {
                if (error) {
                    console.log("Error while closing log file");
                }
            });
        });
    });
};

_log.archeive = () => {
    const fileStamp = `${new Date().getDate()}_${new Date().getMonth()}_${new Date().getFullYear()}.gz`;
    const gzip = zlib.createGzip();
    const destFile = fs.createWriteStream(path.join(__dirname, "../.archeive", fileStamp));
    const trgtFolder = path.join(_log.baseDir);

    destFile.on("close", () => {
        console.log(`Compressed all logs and created ${fileStamp}.gz`);
    });

    fs.readdir(trgtFolder, (error, data) => {
        if (error) {
            console.log("Error while while reading files");
            return;
        }

        data.forEach((fileName) => {
            fs.createReadStream(path.join(trgtFolder, fileName)).pipe(gzip).pipe(destFile);
        });
    });

    fs.readdir(trgtFolder, (error, data) => {
        if (error) {
            console.log(error);
            return;
        }

        data.forEach((fileName) => {
            fs.truncate(path.join(trgtFolder, fileName), 0, (error) => {
                if (error) {
                    console.log("Error while truncating file");
                }
            });
        });
    });
};

module.exports = _log;
