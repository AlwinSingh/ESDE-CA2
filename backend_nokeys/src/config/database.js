const mysql = require('mysql');
const config = require('./config');
//To find out more on createPool:
//https://www.npmjs.com/package/mysql#pooling-connections

const pool = mysql.createPool({
    connectionLimit: 100,
    host: '<removed database url>',
    user: '<removed database username>',
    password: '',
    database: 'competition_system_security_concept_db',
    multipleStatements: true
});

module.exports = pool;