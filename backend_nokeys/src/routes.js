// Import controlers
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
//const checkUserFn = require('./middlewares/checkUserFn');
const authUserFn = require('./middlewares/authUserFn');
// ---> Error Response
const responseSender = require('./middlewares/responseSender');
// ---> Error logging
const retrieveRequestInfo = require('./middlewares/retrieveRequestIP');

//External Library (Express-Brute) that rate limits API to prevent brute force / automated attacks. Not in use at the moment
var ExpressBrute = require('express-brute');
var store = new ExpressBrute.MemoryStore(); // stores state locally, don't use this in production
var bruteforce = new ExpressBrute(store);

var abstractedBouncer = require('./middlewares/bouncer');

// Match URL's with controllers
exports.appRoute = router => {
    router.post('/api/user/login', retrieveRequestInfo.getRequestInformation, abstractedBouncer.bouncerBlock, authController.processLogin); //Middleware that limits the no. of API requests per user
    router.post('/api/user/register', retrieveRequestInfo.getRequestInformation, abstractedBouncer.bouncerBlock, authController.processRegister);
    //router.post('/api/user/process-submission', checkUserFn.getClientUserId, authUserFn.validateNormalUser, userController.processDesignSubmission);

    /* below are routes that have the middleware attached to them

    authUserFn.validateNormalUser - Validates a normal user (role: user & admin)
    authUserFn.validateAdminUser - Validates a admin user (role: admin)

    */

    
    router.post('/api/user/process-submission', retrieveRequestInfo.getRequestInformation, authUserFn.validateNormalUser, userController.processDesignSubmission);
    router.put('/api/user/', retrieveRequestInfo.getRequestInformation, authUserFn.validateAdminUser, userController.processUpdateOneUser);
    router.put('/api/user/design/', retrieveRequestInfo.getRequestInformation, authUserFn.validateNormalUser, userController.processUpdateOneDesign);

    router.get('/api/user/process-search-design/:pagenumber/:search?', retrieveRequestInfo.getRequestInformation, authUserFn.validateNormalUser, userController.processGetSubmissionData);
    router.get('/api/user/process-search-user/:pagenumber/:search?', retrieveRequestInfo.getRequestInformation, authUserFn.validateAdminUser, userController.processGetUserData);
    router.get('/api/user', retrieveRequestInfo.getRequestInformation, authUserFn.validateNormalUser, userController.processGetOneUserData);
    router.get('/api/user/:recordId', retrieveRequestInfo.getRequestInformation, authUserFn.validateAdminUser, userController.processAdminGetOneUserData); //Segregated so that this API is only accessible by an admin, doesn't compromise both admin n user apis
    router.get('/api/user/design/:fileId', retrieveRequestInfo.getRequestInformation, authUserFn.validateNormalUser, userController.processGetOneDesignData);
};