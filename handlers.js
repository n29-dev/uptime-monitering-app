/*
 *
 handlers file
 *
*/

const _data = require('./lib/data');
const helpers = require('./lib/helpers');

const handlers = {};

// users handler
handlers.users = (req, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    // check if method supported or not
    if(acceptedMethods.indexOf(req.method) > -1){
        const methodHandler = handlers._users[req.method];
        methodHandler(req, callback);

    }else{
        callback({statusCode: 405, payload: {
            status: false,
            error: 'Unsupported http method',
        }})
    }
};


handlers._users = {};

handlers._users.post = (req, callback) => {
    const {firstName, lastName, email, phone, password} = helpers.jsonToOject(req.payload);

    const vFirstName = (typeof firstName === 'string' && firstName?.trim()?.length > 0) ? firstName : '';
    const vLastName = (typeof lastName === 'string' && lastName?.trim()?.length > 0) ? lastName : '';
    const vEmail = (typeof email === 'string' && email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g) !== null) ? email : '';
    const vPhone = (typeof phone === 'string' && phone.trim().length === 11) ? phone : '';
    const VPassword = (typeof password === 'string' && password.trim().length >= 8) ? helpers.hash(password) : '';

    // check errr after validation

    switch('') {
            case vFirstName: 
            error = 'Invalid first name';
            break;

            case vLastName: 
            error = 'Invalid last name';
            break;

            case vEmail: 
            error = 'Invalid email name';
            break;

            case vPhone: 
            error = 'Invalid phone number';
            break;

            case VPassword: 
            error = 'Invalid password';
            break;

            default: 
            error = null;
    }

        if(error){
            callback({statusCode: 400, payload: {
                status: false,
                error
            }})
        }

        // write user to filesystem
        const user = {
            name: `${vFirstName} ${vLastName}`,
            email: vEmail,
            phone: vPhone,
            password: VPassword
        }

        _data.create({url: `/users/${vPhone}.json`, data: helpers.objectToJson(user), callback: (error) => {
            // phone number already exists
            if(error){
                callback({statusCode: 200, payload: {
                    status: false,
                    error: 'Phone number already exists'
                }})
            }else {
                callback({
                    statusCode: 200,
                    payload: {
                        status: true,
                        data: user,
                    }
                })
            }
        }})
}


// 404 handler
handlers.notFound = (req, callback) => {
    callback({payload: 'Page not found'});
};

module.exports = handlers;
