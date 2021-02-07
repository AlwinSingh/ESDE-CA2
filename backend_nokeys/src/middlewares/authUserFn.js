/* Custom middleware that makes use of external libraries to decode the JWT n verify the information. Runs validation check against the payload to ensure the JWT is not forged 
with unwanted data */

const jwt_decode = require('jwt-decode');
const responseSender = require('./responseSender')

const validateNormalUser = function validateNormalUser(req, res, next) {
  try {
    var userToken = req.headers['authorization'];

    if (userToken && userToken.length > 1) {
      var token = userToken;

      try {
        var decoded = jwt_decode(token);
        console.log(decoded.id);
      } catch (err) {
        // ---> Error Response
        return responseSender.errorResponse(res, err, 403, 'Unauthorised, invalid token! Access not granted!', res.locals.requestIP);
        //resInformation(res, 403, 'Unauthorised, invalid token! Access not granted!');
      }

      if (decoded) {
        var userId = decoded.id;
        var userRole = decoded.role;
        const userIdRegex = RegExp('^[0-9\.\-\/]+$');

        var regexPass = userIdRegex.test(userId);

        if (regexPass && (userRole == 'user' || userRole == 'admin')) {
          //req.userId = decoded.id;
          res.locals.userId = decoded.id;
          next();
        } else {
          //resInformation(res, 403, 'Unauthorised access. Turn back now!');
          var errObj = { "message": "Unauthorised access. Turn back now!", "stack": "Not available, error has no stack as it is a warning. This is triggered by authUserFn.js (Middleware) code line 36." }
          return responseSender.errorResponse(res, errObj, 403, 'Server is unable to process the request.', res.locals.requestIP, res.locals.apiURL);
        }
        // Else stmt added, edit whenever necessary
      } else {
        var errObj = { "message": "Unauthorised access. Turn back now!", "stack": "Not available, error has no stack as it is a warning. This is triggered by authUserFn.js (Middleware) code line 36." }
        return responseSender.errorResponse(res, errObj, 403, 'Server is unable to process the request.', res.locals.requestIP, res.locals.apiURL);
      }

    } else {
      //resInformation(res, 403, 'Unauthorised access. Turn back now!');
      var errObj = { "message": "Unauthorised access. Turn back now!", "stack": "Not available, error has no stack as it is a warning. This is triggered by authUserFn.js (Middleware) code line 36." }
      return responseSender.errorResponse(res, errObj, 403, 'Server is unable to process the request.', res.locals.requestIP, res.locals.apiURL);
    }
  } catch (err) {
    //console.log(err);
    // ---> Error Response
    return responseSender.errorResponse(res, err, 400, 'Server could not process your request!', res.locals.requestIP);
    //resInformation(res, 400, err);
  }
}

const validateAdminUser = function validateAdminUser(req, res, next) {
  try {
    var userToken = req.headers['authorization'];

    if (userToken && userToken.length > 1) {
      var token = userToken;

      try {
        var decoded = jwt_decode(token);
        console.log(decoded.id);
      } catch (err) {
        // ---> Error Response
        return responseSender.errorResponse(res, err, 403, 'Unauthorised, invalid token! Access not granted!', res.locals.requestIP);
      }

      if (decoded) {
        var userId = decoded.id;
        var userRole = decoded.role;
        const userIdRegex = RegExp('^[0-9\.\-\/]+$');

        var regexPass = userIdRegex.test(userId);

        if (regexPass && userRole == 'admin') {
          //req.userId = decoded.id;
          res.locals.userId = decoded.id;
          next();
        } else {
          var errObj = { "message": "Unauthorised access. Turn back now!", "stack": "Not available, error has no stack as it is a warning. This is triggered by authUserFn.js (Middleware) code line 36." }
          return responseSender.errorResponse(res, errObj, 403, 'Server is unable to process the request.', res.locals.requestIP, res.locals.apiURL);
          //resInformation(res, 403, 'Unauthorised access. Turn back now!');
        }
        // Else stmt added, edit whenever necessary
      } else {
        var errObj = { "message": "Unauthorised access. Turn back now!", "stack": "Not available, error has no stack as it is a warning. This is triggered by authUserFn.js (Middleware) code line 36." }
        return responseSender.errorResponse(res, errObj, 403, 'Server is unable to process the request.', res.locals.requestIP, res.locals.apiURL);
      }

    } else {
      var errObj = { "message": "Unauthorised access. Turn back now!", "stack": "Not available, error has no stack as it is a warning. This is triggered by authUserFn.js (Middleware) code line 36." }
      return responseSender.errorResponse(res, errObj, 403, 'Server is unable to process the request.', res.locals.requestIP, res.locals.apiURL);
      //resInformation(res, 403, 'Unauthorised access. Turn back now!');
    }
  } catch (err) {
    //console.log(err);
    // ---> Error Response
    return responseSender.errorResponse(res, err, 400, 'Server could not process your request!', res.locals.requestIP);
    //resInformation(res, 400, err);
  }
}

/*
//Locally used function, no need for a module export.
function resInformation(res, httpCode, httpMessage) {
  // ---> Error Response
  res.status(httpCode).send({ "errorMsg": httpMessage, "status": httpCode });
}
*/

module.exports.validateNormalUser = validateNormalUser;
module.exports.validateAdminUser = validateAdminUser;