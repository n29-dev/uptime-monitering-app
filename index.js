/*
 *
 Entry file for the application
 *
*/
const server = require("./server");
const worker = require("./worker");
const boot = require('./boot');

const app = {};


// intitialize app function
app.init = () => {
    boot.init();
    server.init();
    worker.init();
};

// init
app.init();