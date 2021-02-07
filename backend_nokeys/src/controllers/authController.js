const user = require('../services/userService');
const auth = require('../services/authService');
const bcrypt = require('bcrypt');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
var customBouncer = require('../middlewares/bouncer');

//var bouncer = require("express-bouncer")(6000, 10000, 5);

// -> Encrypt / Decrypt
const { encrypt, decrypt, encryptEmail, decryptEmail } = require('../middlewares/crypto');
// --> Output Sanitisation
const validator = require('validator');
// ---> Error Response
const responseSender = require('../middlewares/responseSender');
const bouncer = require('express-bouncer')();

exports.processLogin = async (req, res, next) => {
    try {
        let email = req.body.email;
        let password = req.body.password;
        try {
            results = await auth.authenticate(encryptEmail(email));
        } catch (error) {
            return responseSender.errorResponse(res, error, 500, 'Encountered an error, unable to login!', res.locals.requestIP, res.locals.apiURL);
        }

        console.log("Promise returned for login");

        if ((password == null) || (results[0] == null)) {
            // ---> Error Handling
            // 400 - Bad Request (Required fields are missing or header values not filled in)
            return responseSender.errorResponse(res, error, 400, 'Password field is empty.', res.locals.requestIP, res.locals.apiURL);
        } else {
            if (bcrypt.compareSync(password, results[0].user_password) == true) {
                let data = {
                    //Added in role_name to the JWT
                    // --> Output Sanitisation
                    user_id: validator.escape(String(results[0].user_id)),
                    role_name: validator.escape(String(results[0].role_name)),
                    token: validator.escape(String(jwt.sign({ id: results[0].user_id, role: results[0].role_name }, config.JWTKey, {
                        expiresIn: 86400 //Expires in 24 hrs
                    })))
                }; //End of data variable setup

                customBouncer.bouncerReset(req);
                return responseSender.successResponse(res, results, data);
            } else {
                // ---> Error Handling
                // 401 - Unauthorized
                var errObj = { "message": "Invalid Credentials", "stack": "Not available, error has no stack because it originates from the end-user's input of invalid credentials." }
                return responseSender.errorResponse(res, errObj, 401, 'Invalid credentials', res.locals.requestIP, res.locals.apiURL);
                // Old code:
                // return res.status(500).json({ message: error });
                //End of password comparison with the retrieved decoded password.
            }
        }
    } catch (error) {
        // ---> Error Handling
        // 500 - Internal Server Error
        return responseSender.errorResponse(res, error, 500, 'Login has failed', res.locals.requestIP, res.locals.apiURL);
    } //end of try
}; //End of processLogin

// If user submitted data, run the code in below
//It has to be an arrowhead function due to async and await
exports.processRegister = (req, res, next) => {
    try {
        console.log('processRegister running');
        let fullName = req.body.fullName;
        let email = req.body.email;
        let password = req.body.password;

        //Regex for input fields
        var passwordRegex = new RegExp(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8,})$/);
        var emailRegex = new RegExp(/(?!.*[\.]{2})^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/);
        var userNameRegex = new RegExp(/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/);

        //Regex test
        var passCheck = passwordRegex.test(password);
        var emailCheck = emailRegex.test(email);
        var nameCheck = userNameRegex.test(fullName);

        //Conditional statement, all test must be passed to proceed
        if (passCheck && emailCheck && nameCheck) {
            bcrypt.hash(password, 10, async (err, hash) => {
                if (err) {
                    // ---> Error Handling
                    console.log('Error on hashing password');
                    // 500 - Internal Server Error  
                    return responseSender.errorResponse(res, error, 500, 'Unable to complete registration', res.locals.requestIP, res.locals.apiURL);
                } else {
                    try {
                        results = await user.createUser(fullName, encryptEmail(email), hash);
                        if (results) {
                            customBouncer.bouncerReset(req);
                            return responseSender.successResponse(res, results, { message: 'Completed registration' });
                        } else {
                            // ---> Error Handling
                            // 500 - Internal Server Error  
                            return responseSender.errorResponse(res, error, 500, 'Unable to complete registration', res.locals.requestIP, res.locals.apiURL);
                        }
                    } catch (error) {
                        return responseSender.errorResponse(res, error, 500, 'Unable to complete registration', res.locals.requestIP, res.locals.apiURL);
                    }
                }
            });
        } else {
            let errMsg = "";
            //Error message through concatenation
            if (!passCheck) {
                errMsg += `Password is not strong enough! Contain at least 8 characters, at least 1 number, at least 1 lowercase character (a-z) and at least 1 uppercase character (A-Z) \n`;
            }

            if (!emailCheck) {
                errMsg += `Email is not a valid email! \n`;
            }

            if (!nameCheck) {
                errMsg += `Username is not valid, it contains characters that are not permitted! \n`;
            }
            // 400 - Bad Request
            var errObj = { "message": "Registration field is invalid!", "stack": "Not available, error has no stack because it originates from the end-user's input of invalid registration information." }
            return responseSender.errorResponse(res, errObj, 400, errMsg, res.locals.requestIP, res.locals.apiURL);
            // return res.status(400).json({ message: errMsg });
        }
    } catch (error) {
        // ---> Error Handling
        // 500 - Internal Server Error  
        return responseSender.errorResponse(res, error, 500, 'Unable to complete registration', res.locals.requestIP, res.locals.apiURL);
    }

}; //End of processRegister