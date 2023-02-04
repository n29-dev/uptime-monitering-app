/*
 *
 app config
 *
*/
const config = {};

const WEEK_IN_MILI_SEC = 1000 * 60 * 60 * 24 * 7;

// development config
config.development = {
    httpPort: 3000,
    httpsPort: 3001,
    env: "development",
    hashSecret: "secret",
    authTokenPeriod: WEEK_IN_MILI_SEC,
    maxCheckReqTimeout: 10,
    twilio: {
        number: "+17753129083",
        authToken: process.env.TWILIO_ACCESS_TOKEN,
        accountSid: process.env.TWILIO_ACCOUNT_SID,
    },
};

// production config
config.production = {
    httpPort: 5000,
    httpsPort: 5001,
    env: "production",
    hashSecret: "secret",
    authTokenPeriod: WEEK_IN_MILI_SEC,
    maxCheckReqTimeout: 10,
    twilio: {
        number: "+17753129083",
        authToken: process.env.TWILIO_ACCESS_TOKEN,
        accountSid: process.env.TWILIO_ACCOUNT_SID,
    },
};

const currentEnv = process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : "";

const exportConfig = config[currentEnv] || config.development;

module.exports = exportConfig;
