const winston = require('winston');

// ---> Error logging
const logger = winston.createLogger({
    level: 'error',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

// ---> Success Response
const successResponse = function successResponse(res, dbResult, json) {
    console.log('==success response==')
    //console.log('Database result \n' +dbResult);
    return res.status(200).json(json);
}

// ---> Error Response
const errorResponse = function errorResponse(res, errObj, code, message, reqIp, apiName) {
    //console.log('==Error================================================================\n', errObj, '\n=======================================================================');
    console.log('==error response==')
    let redirect = true; //This provides modularity to be consumed by frontend as to whether the error should be redirected or not

    try {

        if (!errObj.redirect) {
            redirect = errObj.redirect;
        } else {
            redirect = true;
        }

        console.error('Error Message: ' + errObj.message);
        console.error('Error Stack: ' + errObj.stack);
        console.log('Error Requester IP: ' + reqIp);
        console.log('API: ' + apiName);
        console.log('Timestamp: ' + new Date().toLocaleString());
        console.log('==end of error response==')

        // ---> Error Logging
        logger.log('error', `Error Message: ${errObj.message} \n\n Error Stack: ${errObj.stack} \n\n Request IP: ${reqIp} \n\n API: ${apiName} \n\n Timestamp: ${new Date().toLocaleString()} \n\n`);
    } catch (error) {
        const localErrorObj = new Error('Unable to handle the error response!');
        console.error('Error Message: ' + localErrorObj.message);
        console.error('Error Stack: ' + localErrorObj.stack);

        // ---> Error Logging
        logger.log('error', `Error Message: ${errObj.message} \n\n Error Stack: ${errObj.stack}`);
    }
    return res.status(code).json({ "errorMsg": message, "status": code, "redirect": redirect });
}

module.exports.errorResponse = errorResponse;
module.exports.successResponse = successResponse;