var bouncer = require("express-bouncer")(300000, 172800000, 5);
// ---> Error Response
const responseSender = require('./responseSender');

/*
express-bouncer ([min], [max], [free])
min The minimum number of milliseconds the user can be forced to wait. (default: 500 ms)
max The maximum number of milliseconds the user can be forced to wait. (default: 10 min)
free The number of attempts a user can make before being forced to wait. (default: 2)
*/

// Add white-listed addresses (optional)
//bouncer.whitelist.push ("127.0.0.1");

var getReq;

// In case we want to supply our own error (optional)
bouncer.blocked = function (req, res, next, remaining) {
    getReq = req;

   var errObj = { "message": "You are making too many requests", "stack": "No stack provided. Originates from bouncer in routes.js Line 16.", "redirect": false }
    responseSender.errorResponse(res, errObj, 429, "You are making too many requests, " +
    "please wait " + remaining / 1000 + " seconds");
};

module.exports.bouncerBlock = bouncer.block;
module.exports.bouncerReset = function resetBouncer(req) {
    bouncer.reset(req);
}