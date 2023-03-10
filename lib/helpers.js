/*
 *
 file for helper functions
 *
*/
const crypto = require("node:crypto");
const config = require("../config");
const fs = require("node:fs");
const path = require("node:path");

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
    try {
        const token = crypto.randomBytes(32).toString("hex");
        return token;
    } catch (error) {
        console.log("!!Error: generate token!!", error);
        return null;
    }
};

// craete id
helpers.createId = (pf) => {
    try {
        const token = crypto.randomBytes(8).toString("hex");
        return `${pf}:${token}`;
    } catch (error) {
        console.log("!!Error: generate token!!", error);
        return null;
    }
};

// validate token
helpers.validateToken = (userToken, storedTokenObj) => {
    if (userToken !== storedTokenObj.key) {
        return {
            status: false,
            error: "Token did not match",
        };
    }

    if (storedTokenObj.expires < Date.now()) {
        return {
            status: false,
            error: "Token has expired",
        };
    }

    return {
        status: true,
    };
};

// check if undefined
helpers.isUndefined = (value) => {
    return typeof value === "undefined";
};

const input = {};

// name validation
input.isValidNameFormat = (name) => {
    return name?.trim()?.length > 0 ? true : false;
};

// email validation
input.isValidEmailFormat = (email) => {
    return email?.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)?.length ? true : false;
};

// phone validaton
input.isValidPhoneFormat = (phone) => {
    return phone?.trim()?.length === 11 ? true : false;
};

// password validation
input.isValidPasswordFormat = (password) => {
    return password?.length >= 8 ? true : false;
};

// url validation
input.isValidUrl = (url) => {
    return typeof url === "string" && url.trim().length > 0;
};

// method vaidation
input.isValidInputArray = (methods) => {
    return methods instanceof Array && methods.length > 0;
};

input.isValidProtocol = (protocol) => {
    return protocol === "http" ? true : protocol === "https" ? true : false;
};

input.isValidTimeout = (timeout) => {
    return typeof timeout === "number" && timeout < config.maxCheckReqTimeout;
};

helpers.input = input;

module.exports = helpers;
