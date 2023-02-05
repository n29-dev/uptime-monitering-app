/*
 *
 Entry file for the server
 *
*/
const http = require("node:http");
const https = require("node:https");
const url = require("node:url");
const fs = require("node:fs");
const path = require("node:path");

const router = require("../router/router");
const handlers = require("../handlers");

const config = require("../config");
const helpers = require("../lib/helpers");

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

        const defaultJsonHeaders = { "Content-Type": "application/json" };
        const defaultHTMLHeaders = { "Content-Type": "text/html" };

        const handlerCallback = ({
            payload: responsePayload,
            statusCode: responseStatusCode = 200,
            contentType = "json",
            headers,
        }) => {
            if (contentType === "html") {
                headers = headers ? headers : defaultHTMLHeaders;
                responsePayload = responsePayload ? responsePayload : "";
            } else {
                headers = headers ? headers : defaultJsonHeaders;
                responsePayload = helpers.objectToJson(responsePayload);
            }

            res.writeHead(responseStatusCode, headers);
            res.write(responsePayload);
            res.end();
        };

        handler(data, handlerCallback);
    });
};

// http server
server.httpServer = http.createServer(server.serverFn);

// https server
server.httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, "../https/server.key")),
    cert: fs.readFileSync(path.join(__dirname, "../https/server.cert")),
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
