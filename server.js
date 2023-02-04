/*
 *
 Entry file for the server
 *
*/
const http = require("node:http");
const https = require("node:https");
const url = require("node:url");
const fs = require("node:fs");

const router = require("./router");
const handlers = require("./handlers");

const config = require("./config");
const helpers = require("./lib/helpers");

const server = {};

// server fn
server.serverFn = (req, res) => {
    const { pathname, query } = url.parse(req.url, true);
    const path = pathname.replace(/^\/|\/$/g, "");
    const method = req.method.toLowerCase();
    const headers = req.headers;

    let payload = "";
    const decoder = new TextDecoder("UTF-8");

    req.on("data", (data) => {
        payload += decoder.decode(data);
    });

    req.on("end", () => {
        const handler = router[path] || handlers.notFound;

        const data = {
            path,
            query,
            method,
            payload,
            headers,
        };

        const defaultHeaders = { "Content-Type": "application/json" };

        handler(
            data,
            ({
                payload: responsePayload = "",
                headers: responseHeaders = defaultHeaders,
                statusCode: responseStatusCode = 200,
            }) => {
                res.writeHead(responseStatusCode, responseHeaders);
                res.write(helpers.objectToJson(responsePayload));
                res.end();
            }
        );
    });
};

// http server
server.httpServer = http.createServer(server.serverFn);

// https server
server.httpsOptions = {
    key: fs.readFileSync("./https/server.key"),
    cert: fs.readFileSync("./https/server.cert"),
};

server.httpsServer = https.createServer(server.httpsOptions, server.serverFn);

server.init = () => {
    // listen for requests
    server.httpServer.listen(config.httpPort, () => {
        console.log(`Server listening on port ${config.httpPort} in ${config.env}`);
    });

    server.httpsServer.listen(config.httpsPort, () => {
        console.log(`Server listening on port ${config.httpsPort} in ${config.env}`);
    });
};

module.exports = server;