/*
 *
 app config
 *
*/

const config = {};

// development config
config.development = {
    httpPort: 3000,
    httpsPort: 3001,
    env: 'development'
};

// production config
config.production = {
    httpPort: 5000,
    httpsPort: 5001,
    env: 'production'
}

const currentEnv = process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : '';

const exportConfig = config[currentEnv] || config.development;

module.exports = exportConfig;