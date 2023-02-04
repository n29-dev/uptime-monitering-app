/*
 *
 Entry file for the application
 *
*/

const server = require('./server');
const worker = require('./worker')

const app = {};

// intitialize app function
app.init = () => {
    server.init();
    worker.init();
};

// init
app.init();