/*
 *
 file for helper functions
 *
*/
const crypto = require('node:crypto');
const config = require('../config')

const helpers = {};

// convert user payload to jsont object
helpers.jsonToOject = (data) => {
    let transformedData;

    try {
        transformedData = JSON.parse(data);
    } catch (error) {
        transformedData = {};
    }

    return transformedData;
};

// convert object to json
helpers.objectToJson = (data) => {
    return JSON.stringify(data);
}

// hast user passowrd 
helpers.hash = (str) => {
    const key = str.toString();
    const hashed = crypto.createHmac('sha256', config.hashSecret).update(key).digest('hex');
    return hashed;
}

module.exports = helpers;
