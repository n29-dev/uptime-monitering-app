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
        let handler;

        if (path.indexOf("public") > -1) {
            handler = handlers.public;
        } else {
            handler = router[path] || handlers.notFound;
        }

        const data = {
            path,
            query,
            method,
            payload,
            headers,
        };

        const defaultJsonHeaders = { "Content-Type": "application/json" };
        const defaultHTMLHeaders = { "Content-Type": "text/html" };
        const defaultCssHeaders = { "Content-Type": "text/css" };
        const defaultJsHeaders = { "Content-Type": "text/javascript" };
        const defaultPngHeaders = { "Content-Type": "image/png" };
        const defaultFaviconHeaders = { "Content-Type": "image/x-icon" };

        const handlerCallback = ({
            payload: responsePayload,
            statusCode: responseStatusCode = 200,
            contentType = "json",
            headers,
        }) => {
            switch (contentType) {
                case "html":
                    headers = headers ? headers : defaultHTMLHeaders;
                    responsePayload = responsePayload ? responsePayload : "";
                    break;
                case "css":
                    headers = headers ? headers : defaultCssHeaders;
                    responsePayload = responsePayload ? responsePayload : "";
                    break;
                case "js":
                    headers = headers ? headers : defaultJsHeaders;
                    responsePayload = responsePayload ? responsePayload : "";
                    break;
                case "png":
                    headers = headers ? headers : defaultPngHeaders;
                    responsePayload = responsePayload ? responsePayload : "";
                    break;
                case "ico":
                    headers = headers ? headers : defaultFaviconHeaders;
                    responsePayload = responsePayload ? responsePayload : "";
                    break;
                default:
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
    key: fs.readFileSync(path.join(__dirname, "../https/private.key")).toString(),
    cert: fs.readFileSync(path.join(__dirname, "../https/certificate.crt")).toString(),
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
