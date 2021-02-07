config = require('../config/config');
const pool = require('../config/database')
const authenticate = function authenticate(email) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                if (err) throw err;
            } else {
                try {
                    //Changed to parameterised query
                    connection.query(`SELECT user.user_id, full_name, email, user_password, role_name, user.role_id  
                   FROM user INNER JOIN role ON user.role_id=role.role_id AND email=?`, email, (err, rows) => {
                        if (err) {
                            // ---> Error Response
                            if (err) return reject(new Error(err.sqlMessage));
                        } else {
                            if (rows.length == 1) {
                                console.log(rows);
                                resolve(rows);
                                //return callback(null, rows);
                            } else {
                                // ---> Error Response
                                //reject(new Error('Login has failed (Email does not exist)'));
                                return reject({ "message": "Login has failed (Email does not exist)", "stack": "No stack provided. Originates from invalid credentials. authService.js Line 24. Error is caught at authController Line 56.", "redirect": false });
                                //return callback(new Error('Login has failed (Email does not exist)'), null);
                            }
                        }
                        connection.release();

                    });
                } catch (error) {
                    // ---> Error Response
                    return reject(new Error(error.message));
                    //return callback(error.message, null);;
                }
            }
        }); //End of getConnection
    }); //End of promise
} //End of authenticate

module.exports.authenticate = authenticate;