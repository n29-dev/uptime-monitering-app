/*
 *
 file for helper functions
 *
*/
const crypto = require("node:crypto");
const config = require("../config");

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
};

// hash user passowrd
helpers.hash = (str) => {
    const key = str.toString();
    const hashed = crypto.createHmac("sha256", config.hashSecret).update(key).digest("hex");
    return hashed;
};

// create token
helpers.createToken = () => {
    try{
        const token = crypto.randomBytes(32).toString('hex');
        return token;
    }catch(error){
        console.log('!!Error: generate token!!', error);
        return null;
    }
}

// validate token
helpers.validateToken = (userToken, storedTokenObj) => {
    if(userToken !== storedTokenObj.key){
        return {
            status: false,
            error: 'Token did not match'
        }
    }

    if(storedTokenObj.expires > Date.now){
        return {
            status: false,
            error: 'Token has expired'
        }
    }

    return {
        status: true,
    }
}

module.exports = helpers;
