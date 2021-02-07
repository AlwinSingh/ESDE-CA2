// Retrieve client's IP address
const requestIp = require('request-ip');

const requestInfoMiddleware = function (req, res, next) {
    const clientIp = requestIp.getClientIp(req);
    var apiURL = req.protocol + '://' + req.get('host') + req.originalUrl;

    res.locals.requestIP = clientIp;
    res.locals.apiURL = apiURL;

    next();
};
// on localhost you'll see 127.0.0.1 if you're using IPv4 
// or ::1, ::ffff:127.0.0.1 if you're using IPv6

module.exports.getRequestInformation = requestInfoMiddleware;