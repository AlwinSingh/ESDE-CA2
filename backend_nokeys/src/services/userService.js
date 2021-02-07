const config = require('../config/config');
const pool = require('../config/database');
const { encrypt, decrypt, encryptEmail, decryptEmail } = require('../middlewares/crypto');

const createUser = function createUser(fullname, email, password) {
    console.log(fullname, email, password);
    return new Promise((resolve, reject) => {
        // Referred to https://www.codota.com/code/javascript/functions/mysql/Pool/getConnection
        // to prepare the following code pattern which does not use callback technique (uses Promise technique)
        pool.getConnection((err, connection) => {
            if (err) {
                console.log('Database connection error ', err);
                // ---> Error Response
                return reject(new Error(err.sqlMessage));
            } else {
                connection.query('INSERT INTO user ( full_name, email, user_password, role_id) VALUES (?,?,?,2) ', [fullname, email, password], (err, rows) => {
                    if (err) {
                        // ---> Error Response
                        return reject(new Error(err.sqlMessage));
                    } else {
                        resolve(rows);
                    }
                    connection.release();
                });
            }
        });
    }); //End of new Promise object creation
} //End of createUser

const updateUser = function updateUser(recordId, newRoleId) {
    return new Promise((resolve, reject) => {
        // Referred to https://www.codota.com/code/javascript/functions/mysql/Pool/getConnection
        // to prepare the following code pattern which does not use callback technique (uses Promise technique)
        pool.getConnection((err, connection) => {
            if (err) {
                console.log('Database connection error ', err);
                // ---> Error Response
                return reject(new Error(err.sqlMessage));
            } else {
                connection.query(`UPDATE user SET role_id =? WHERE user_id=?`, [newRoleId, recordId], (err, rows) => {
                    if (err) {
                        // ---> Error Response
                        return reject(new Error(err.sqlMessage));
                    } else {
                        resolve(rows);
                    }
                    connection.release();
                });
            }
        });
    }); //End of new Promise object creation
} //End of updateUser

const getUserData = function getUserData(pageNumber, search) {
    console.log('getUserData method is called.');
    const page = pageNumber;
    if (search == null) { search = ''; };
    const limit = 4; //Due to lack of test files, I have set a 3 instead of larger number such as 10 records per page
    const offset = (page - 1) * limit;

    //If the user did not provide any search text, the search variable
    //should be null. The following console.log should output undefined.
    //console.log(search);
    //-------------- Code which does not use stored procedure -----------
    //Query for fetching data with page number, search text and offset value
    if ((search == '') || (search == null)) {
        console.log('Prepare query without search text');
        userDataQuery = `SELECT user_id, full_name, email, role_name 
        FROM user INNER JOIN role ON user.role_id = role.role_id LIMIT ${limit} OFFSET ${offset};
        SET @total_records =(SELECT count(user_id) FROM user    );SELECT @total_records total_records; `;
    } else {
        userDataQuery = `SELECT user_id, full_name, email, role_name 
        FROM user INNER JOIN role ON user.role_id = role.role_id AND full_name LIKE '%${search}%'  LIMIT ${limit} OFFSET ${offset};
    SET @total_records =(SELECT count(user_id) FROM user WHERE full_name LIKE '%${search}%' );SELECT @total_records total_records;`;
    }

    return new Promise((resolve, reject) => {
        // Referred to https://www.codota.com/code/javascript/functions/mysql/Pool/getConnection
        // to prepare the following code pattern which does not use callback technique (uses Promise technique)
        pool.getConnection((err, connection) => {
            if (err) {
                console.log('Database connection error ', err);
                // ---> Error Response
                return reject(new Error(err.sqlMessage));
            } else {

                connection.query(userDataQuery, [search, offset, limit], (err, results) => {
                    if (err) {
                        // ---> Error Response
                        return reject(new Error(err.sqlMessage));
                    } else {
                        console.log('Accessing total number of rows : ', results[2][0].total_records);
                        resolve(results);
                    }
                    connection.release();
                });
            }
        });
    }); //End of new Promise object creation

} //End of getUserData

const getOneUserData = function getOneUserData(recordId) {
    console.log('getOneUserData method is called.');
    console.log('Prepare query to fetch one user record');
    userDataQuery = `CALL getUserProfile(?)`;

    //console.log(userDataQuery);

    return new Promise((resolve, reject) => {
        // Referred to https://www.codota.com/code/javascript/functions/mysql/Pool/getConnection
        // to prepare the following code pattern which does not use callback technique (uses Promise technique)

        //Just to ensure data typeof Integrity
        try {
            recordId = parseInt(recordId);
        } catch (error) {
            //console.log("Error parsing record ID to integer!");
            return reject(new Error('Failed to parse record id to integer during retrieval!'));
        }

        pool.getConnection((err, connection) => {
            if (err) {
                console.log('Database connection error ', err);
                // ---> Error Response
                return reject(new Error(err.sqlMessage));
            } else {
                connection.query(userDataQuery, recordId, (err, results) => {
                    if (err) {
                        // ---> Error Response
                        return reject(new Error(err.sqlMessage));
                    } else {
                        resolve(results);
                    }
                    connection.release();
                });
            }
        });
    }); //End of new Promise object creation
} //End of getOneUserData

const getOneDesignData = function getOneDesignData(recordId, userId) {
    console.log('getOneDesignData method is called.');
    console.log('Prepare query to fetch one design record');
    userDataQuery = `SELECT file_id,cloudinary_file_id,cloudinary_url,design_title,design_description 
        FROM file WHERE file_id=? AND created_by_id=?`;

    return new Promise((resolve, reject) => {
        // Referred to https://www.codota.com/code/javascript/functions/mysql/Pool/getConnection
        // to prepare the following code pattern which does not use callback technique (uses Promise technique)
        pool.getConnection((err, connection) => {
            if (err) {
                console.log('Database connection error ', err);
                // ---> Error Response
                return reject(new Error(err.sqlMessage));
            } else {
                connection.query(userDataQuery, [recordId, userId], (err, results) => {
                    if (err) {
                        // ---> Error Response
                        return reject(new Error(err.sqlMessage));
                    } else {
                        // -> Decrypt
                        if (results && results.length > 0) {
                        results[0].cloudinary_url = decrypt(results[0].cloudinary_url);
                        resolve(results);
                        } else {
                            return reject(new Error("File retrieval failed. No file found for that user."))
                        }
                    }
                    connection.release();
                });
            }
        });
    }); //End of new Promise object creation
} //End of getOneDesignData

const updateDesign = function updateDesign(recordId, title, description) {
    return new Promise((resolve, reject) => {
        // Referred to https://www.codota.com/code/javascript/functions/mysql/Pool/getConnection
        // to prepare the following code pattern which does not use callback technique (uses Promise technique)
        pool.getConnection((err, connection) => {
            if (err) {
                console.log('Database connection error ', err);
                // ---> Error Response
                reject(new Error(err.sqlMessage));
            } else {
                connection.query(`UPDATE file SET design_title =? , design_description=? WHERE file_id=?`, [title, description, recordId], (err, rows) => {
                    if (err) {
                        // ---> Error Response
                        return reject(new Error(err.sqlMessage));
                    } else {
                        resolve(rows);
                    }
                    connection.release();
                });
            }
        });
    }); //End of new Promise object creation
} //End of updateDesign

module.exports.createUser = createUser;
module.exports.updateUser = updateUser;
module.exports.getUserData = getUserData;
module.exports.getOneUserData = getOneUserData;
module.exports.getOneDesignData = getOneDesignData;
module.exports.updateDesign = updateDesign;