/*
 *
 Entry file for the server
 *
*/
const http = require("node:http");
const https = require('node:https')
const url = require("node:url");
const fs = require('node:fs')

const router = require("./router");
const handlers = require("./handlers");

const config = require('./config');

// server fn
const server = (req, res) => {
    const { pathname, query } = url.parse(req.url);
    const path = pathname.replace(/^\/|\/$/g, "");
    const method = req.method.toUpperCase();

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
        };

        const defaultHeaders = {'Content-Type': 'application/json'}

        handler(
            data,
            ({
                payload: responsePayload = "",
                headers: responseHeaders = defaultHeaders,
                statusCode: responseStatusCode = 200,
            }) => {
                res.writeHead(responseStatusCode, responseHeaders);
                res.write(responsePayload);
                res.end();
            }
        );
    });
}

// http server
const httpServer = http.createServer(server);

// https server
const httpsOptions = {
    key: fs.readFileSync('./https/server.key'),
    cert: fs.readFileSync('./https/server.cert')
}

const httpsServer = https.createServer(httpsOptions, server);

// listen for requests
httpServer.listen(config.httpPort, () => {
    console.log(`Server listening on port ${config.httpPort} in ${config.env}`);
});

httpsServer.listen(config.httpsPort, () => {
    console.log(`Server listening on port ${config.httpsPort} in ${config.env}`);
})
