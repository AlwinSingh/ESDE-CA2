const userManager = require('../services/userService');
const fileDataManager = require('../services/fileService');
const config = require('../config/config');
const { encrypt, decrypt, encryptEmail, decryptEmail } = require('../middlewares/crypto');
const validator = require('validator');
const sanitiseURL = require('../middlewares/urlSanitise');
// ---> Error Response
const responseSender = require('../middlewares/responseSender')

exports.processDesignSubmission = (req, res, next) => {
    try {
        console.log('processDesignSubmission running');
        let designTitle = req.body.designTitle;
        let designDescription = req.body.designDescription;

        var inputRegex = new RegExp(/^(\w|\s)*[a-zA-Z]+(\w|\s)*$/);

        if (inputRegex.test(designTitle) && inputRegex.test(designDescription)) {

            let userId = res.locals.userId;
            let file = req.body.file;
            fileDataManager.uploadFile(file, async function (error, result) {
                console.log('check result variable in fileDataManager.upload code block\n', result);
                let uploadResult = result;
                if (error) {
                    // ---> Error Handling
                    // 400 - Bad Request (Required fields are missing or header values are not filled in)
                    return responseSender.errorResponse(res, error, 400, 'Unable to complete file submission, recheck your input.', res.locals.requestIP, res.locals.apiURL);
                } else {
                    //Update the file table inside the MySQL when the file image
                    //has been saved at the cloud storage (Cloudinary)
                    let imageURL = uploadResult.imageURL; //encrypted.
                    let publicId = uploadResult.publicId;
                    console.log('check uploadResult before calling createFileData in try block', uploadResult);

                    let result;
                    // -> Encrypt
                    try {
                        result = await fileDataManager.createFileData(encrypt(imageURL), encrypt(publicId), userId, designTitle, designDescription);
                        console.log('Inspect result variable inside fileDataManager.uploadFile code');
                        if (result) {
                            let message = 'File submission completed.';
                            // --> Output Sanitisation
                            var json = {
                                message: validator.escape(String(message)),
                                image_url: sanitiseURL.sanitiseURL(String(imageURL))
                            };
                            return responseSender.successResponse(res, result, json);
                        } else {
                            // ---> Error Handling
                            // 500 - Internal Server Error  
                            var errObj = { "message": "File submission failed", "stack": "Not available, error has no stack but it originates from userController.js line 41 where there is no valid result being returned." }
                            return responseSender.errorResponse(res, errObj, 500, 'File submission failed.', res.locals.requestIP, res.locals.apiURL);
                        }
                    } catch (error) {
                        return responseSender.errorResponse(res, error, 500, "Unable to process submission!", res.locals.requestIP, res.locals.apiURL);
                    }
                }
            });
        } else {
            var errObj = { "message": "File submission failed", "stack": "Not available, error has no stack but it originates from userController.js line 18 where input does not meet the regular expression checks." }
            return responseSender.errorResponse(res, errObj, 500, 'File submission failed. Invalid input.', res.locals.requestIP, res.locals.apiURL, false);
        }
    }
    catch (error) {
        // ---> Error Handling
        console.log('processDesignSubmission method : catch block section code is running');
        // 500 - Internal Server Error  
        return responseSender.errorResponse(res, error, 500, 'File submission failed.');
    }
}; //End of processDesignSubmission

exports.processGetSubmissionData = async (req, res, next) => {
    try {
        console.log('processGetSubmissionData running');
        let pageNumber = req.params.pagenumber;
        let search = req.params.search;
        let userId = res.locals.userId;
        let results;

        try {
            results = await fileDataManager.getFileData(userId, pageNumber, search);
            if (results) {
                console.log('Inspect result variable inside processGetSubmissionData code\n', results);
                // --> Output Sanitisation
                for (let i = 0; i < results[0].length; i++) {
                    results[0][i].file_id = validator.escape(String(results[0][i].file_id));
                    results[0][i].cloudinary_url = sanitiseURL.sanitiseURL(String(results[0][i].cloudinary_url));
                    results[0][i].design_title = validator.escape(String(results[0][i].design_title));
                    results[0][i].design_description = validator.escape(String(results[0][i].design_description));
                }
                // --> Output Sanitisation
                var jsonResult = {
                    'number_of_records': validator.escape(String(results[0].length)),
                    'page_number': validator.escape(String(pageNumber)),
                    'file_data': results[0],
                    'total_number_of_records': validator.escape(String(results[2][0].total_records))
                }
                return responseSender.successResponse(res, results, jsonResult);
            } else {
                // ---> Error Handling
                // 500 - Internal Server Error  
                var errObj = { "message": "Server is unable to process design retrieval.", "stack": "Not available, error has no stack but it originates from userController.js line 83 where there is no valid result being returned.." }
                return responseSender.errorResponse(res, errObj, 500, 'Server is unable to process your request.', res.locals.requestIP, res.locals.apiURL);
            }
        } catch (error) {
            return responseSender.errorResponse(res, error, 500, "Unable to get file data!", res.locals.requestIP, res.locals.apiURL);
        }
    } catch (error) {
        // ---> Error Handling
        console.log('processGetSubmissionData method : catch block section code is running');
        // 500 - Internal Server Error  
        return responseSender.errorResponse(res, error, 500, 'Server is unable to process your request.', res.locals.requestIP, res.locals.apiURL);
        // Old Code:
        // let message = 'Server is unable to process your request.';
        // return res.status(500).json({
        //     message: error
        // });
    }
}; //End of processGetSubmissionData

exports.processGetUserData = async (req, res, next) => {
    try {
        console.log('processGetUserData running');
        let pageNumber = req.params.pagenumber;
        let search = req.params.search;
        let results;

        try {
            results = await userManager.getUserData(pageNumber, search);
        } catch (error) {
            return responseSender.errorResponse(res, error, 500, "Unable to get all user data!", res.locals.requestIP, res.locals.apiURL);
        }

        if (results) {
            console.log('Inspect result variable inside processGetUserData code\n', results);
            // --> Output Sanitisation
            for (let i = 0; i < results[0].length; i++) {
                results[0][i].user_id = validator.escape(String(results[0][i].user_id));
                results[0][i].full_name = validator.escape(String(results[0][i].full_name));
                // -> Decrypt
                results[0][i].email = validator.escape(String(decryptEmail(results[0][i].email)));
                results[0][i].role_name = validator.escape(String(results[0][i].role_name));
            }
            // --> Output Sanitisation
            var jsonResult = {
                'number_of_records': validator.escape(String(results[0].length)),
                'page_number': validator.escape(String(pageNumber)),
                'user_data': results[0],
                'total_number_of_records': validator.escape(String(results[2][0].total_records))
            }
            return responseSender.successResponse(res, results, jsonResult);
        } else {
            // ---> Error Handling
            // 500 - Internal Server Error  
            var errObj = { "message": "Server is unable to process user retrieval.", "stack": "Not available, error has no stack but it originates from userController.js line 135 where there is no valid result being returned.." }
            return responseSender.errorResponse(res, errObj, 500, 'Server is unable to process your request.', res.locals.requestIP, res.locals.apiURL);
        }
    } catch (error) {
        // ---> Error Handling
        console.log('processGetUserData method : catch block section code is running');
        // 500 - Internal Server Error  
        return responseSender.errorResponse(res, error, 500, 'Server is unable to process your request.', res.locals.requestIP, res.locals.apiURL);

        // Old Code:
        // let message = 'Server is unable to process your request.';
        // return res.status(500).json({
        //     message: error
        // });
    }

}; //End of processGetUserData

exports.processGetOneUserData = async (req, res, next) => {
    try {
        //let recordId = req.params.recordId; //This is a user's id
        let recordId = res.locals.userId; //User id is retrieved from the JWT directly. This is so that users cannot access other users' profile.

        var userIdRegExp = RegExp(/^[0-9]*$/);
        var userIdCheck = false;
        let results;

        if (recordId && recordId != null) {
            userIdCheck = userIdRegExp.test(recordId);
        }

        if (userIdCheck) {

            try {
                results = await userManager.getOneUserData(recordId);
            } catch (error) {
                return responseSender.errorResponse(res, error, 500, "Unable to get your user data!", res.locals.requestIP, res.locals.apiURL);
            }
            if (results) {
                console.log('Inspect result variable inside processGetOneUserData code\n', results);
                // --> Output Sanitisation
                results[0][0].user_id = validator.escape(String(results[0][0].user_id));
                results[0][0].full_name = validator.escape(String(results[0][0].full_name));
                // -> Decrypt
                results[0][0].email = validator.escape(String(decryptEmail(results[0][0].email)));
                results[0][0].role_id = validator.escape(String(results[0][0].role_id));
                results[0][0].role_name = validator.escape(String(results[0][0].role_name));
                var jsonResult = {
                    'user_data': results[0][0],
                }
                return responseSender.successResponse(res, results, jsonResult);
            } else {
                var errObj = { "message": "Server error", "stack": "Not available, error has no stack but it originates from userController.js line 194 where there is no valid result being returned.." }
                return responseSender.errorResponse(res, errObj, 500, 'Server Error', res.locals.requestIP, res.locals.apiURL);
            }

        } else {
            var errObj = { "message": "Unauthorised access in retrieving one user. (View Profile)", "stack": "Not available, error has no stack but it originates from userController.js line 187 where user does not meet regex pattern. Invalid user id." }
            return responseSender.errorResponse(res, errObj, 403, 'Unauthorised access', res.locals.requestIP, res.locals.apiURL);
        }
    } catch (error) {
        // ---> Error Handling
        console.log('processGetOneUserData method : catch block section code is running');
        // 500 - Internal Server Error  
        return responseSender.errorResponse(res, error, 500, 'Server is unable to process your request.', res.locals.requestIP, res.locals.apiURL);
        // Old Code:
        // let message = 'Server is unable to process your request.';
        // return res.status(500).json({
        //     message: error
        // });
    }
}; //End of processGetOneUserData

exports.processAdminGetOneUserData = async (req, res, next) => {
    try {
        //let recordId = req.params.recordId; //This is a user's id
        let recordId = req.params.recordId; //User id is retrieved from URL as it is dynamic for an admin. Not wise to tamper with localStorage or JWT to pass variable data.
        var userIdRegExp = RegExp(/^[0-9]*$/);
        var userIdCheck = false;
        let results;

        if (recordId && recordId != null) {
            userIdCheck = userIdRegExp.test(recordId);
        }

        if (userIdCheck) {

            try {
                results = await userManager.getOneUserData(recordId);
            } catch (error) {
                return responseSender.errorResponse(res, error, 500, "Unable to get user's data!", res.locals.requestIP, res.locals.apiURL);
            }
            if (results) {
                console.log('Inspect result variable inside processGetOneUserData code\n', results);
                // --> Output Sanitisation
                results[0][0].user_id = validator.escape(String(results[0][0].user_id));
                results[0][0].full_name = validator.escape(String(results[0][0].full_name));
                // -> Decrypt
                results[0][0].email = validator.escape(String(decryptEmail(results[0][0].email)));
                results[0][0].role_id = validator.escape(String(results[0][0].role_id));
                results[0][0].role_name = validator.escape(String(results[0][0].role_name));

                var jsonResult = {
                    'user_data': results[0][0],
                }

                return responseSender.successResponse(res, results, jsonResult);
            } else {
                var errObj = { "message": "Server error", "stack": "Not available, error has no stack but it originates from userController.js line 248 where there is no valid result being returned.." }
                return responseSender.errorResponse(res, errObj, 500, 'Server Error', res.locals.requestIP, res.locals.apiURL);
            }
        } else {
            var errObj = { "message": "Unauthorised access in retrieving one user. (Admin View Profile)", "stack": "Not available, error has no stack but it originates from userController.js line 241 where user does not meet regex pattern. Invalid user id." }
            return responseSender.errorResponse(res, errObj, 403, 'Unauthorised access', res.locals.requestIP, res.locals.apiURL);
        }
    } catch (error) {
        // ---> Error Handling
        console.log('processAdminGetOneUserData method : catch block section code is running');
        // 500 - Internal Server Error  
        return responseSender.errorResponse(res, error, 500, 'Server is unable to process your request.', res.locals.requestIP, res.locals.apiURL);
        // Old Code:
        // let message = 'Server is unable to process your request.';
        // return res.status(500).json({
        //     message: error
        // });
    }

}; //End of processAdminGetOneUserData

exports.processUpdateOneUser = async (req, res, next) => {
    try {
        console.log('processUpdateOneUser running');
        let recordId = req.body.recordId;
        let newRoleId = req.body.roleId;

        try {
            results = await userManager.updateUser(recordId, newRoleId);
        } catch (error) {
            return responseSender.errorResponse(res, error, 500, 'Unable to complete update operation', res.locals.requestIP, res.locals.apiURL);
        }

        return responseSender.successResponse(res, results, { message: 'Completed update' })
    } catch (error) {
        // ---> Error Handling
        console.log('processUpdateOneUser method : catch block section code is running');
        // 500 - Internal Server Error  
        return responseSender.errorResponse(res, error, 500, 'Unable to complete update operation', res.locals.requestIP, res.locals.apiURL);
    }
}; //End of processUpdateOneUser

exports.processGetOneDesignData = async (req, res, next) => {
    try {
        console.log('processGetOneDesignData running');
        let results;
        let recordId = req.params.fileId;
        let userId = res.locals.userId;

        try {
            results = await userManager.getOneDesignData(recordId, userId);
        } catch (error) {
            return responseSender.errorResponse(res, error, 500, `File retrieval failed. Are you sure that's your file?`, res.locals.requestIP, res.locals.apiURL);
        }

        if (results) {
            if (results.length > 0) {
            console.log('Inspect result variable inside processGetOneFileData code\n', results);
            // --> Output Sanitisation
            for (let i = 0; i < results[0].length; i++) {
                results[0][0].file_id = validator.escape(String(results[0][0].file_id));
                results[0][0].cloudinary_file_id = results[0][0].cloudinary_file_id;
                results[0][0].cloudinary_url = sanitiseURL.sanitiseURL(String(results[0][0].cloudinary_url));
                results[0][0].design_title = validator.escape(String(results[0][0].design_title));
                results[0][0].design_description = validator.escape(String(results[0][0].design_description));
            }
            var jsonResult = {
                'file_data': results[0],
            }
            return responseSender.successResponse(res, results, jsonResult);
            } else {
                var errObj = { "message": "File retrieval failed (Not found)", "stack": "Not available, error has no stack but it originates from userController.js line 320 where there is no valid result being returned. This is most likely caused by the user trying to access other users' data." }
                return responseSender.errorResponse(res, errObj, 404, `File retrieval failed. Are you sure that's your file?`, res.locals.requestIP, res.locals.apiURL);
            }
        } else {
            // ---> Error Handling
            // 500 - Internal Server Error  
            return responseSender.errorResponse(res, error, 500, 'Server is unable to process the request. Contact an administrator.', res.locals.requestIP, res.locals.apiURL);
        }
    } catch (error) {
        // ---> Error Handling
        console.log('processGetOneDesignData method : catch block section code is running');
        // 500 - Internal Server Error  
        return responseSender.errorResponse(res, error, 500, 'Server is unable to process the request. Contact an administrator.', res.locals.requestIP, res.locals.apiURL);
        // Old Code:
        // let message = 'Server is unable to process the request.';
    }
}; //End of processGetOneDesignData

exports.processUpdateOneDesign = async (req, res, next) => {
    try {
        console.log('processUpdateOneFile running');
        let fileId = req.body.fileId;
        let designTitle = req.body.designTitle;
        let designDescription = req.body.designDescription;
        // Error is still caught by encapsulating try catch.

        try {
            results = await userManager.updateDesign(fileId, designTitle, designDescription);
        } catch (error) {
            return responseSender.errorResponse(res, error, 500, 'Unable to complete update operation', res.locals.requestIP, res.locals.apiURL);
        }

        return responseSender.successResponse(res, results, { message: 'Completed update' });
    } catch (error) {
        // ---> Error Handling
        console.log('processUpdateOneUser method : catch block section code is running');
        // 500 - Internal Server Error  
        return responseSender.errorResponse(res, error, 500, 'Unable to complete update operation', res.locals.requestIP, res.locals.apiURL);
    }
}; //End of processUpdateOneDesign