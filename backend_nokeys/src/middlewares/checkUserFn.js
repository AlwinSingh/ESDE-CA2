/* This function is no longer used because we retrieve the user's data from the JWT instead that is passed through the authorisation header */

const getClientUserId = function getClientUserId(req, res, next) {
    console.log('http header - user ', req.headers['user']);
    req.body.userId = req.headers['user'];
    console.log('Inspect user id which is planted inside the request header : ', req.body.userId);
    if (req.body.userId != null) {
        next();
        return;
    } else {
        // 403 - Forbidden (Authorization Failed)
        res.status(403).json({ message: 'Unauthorized access' });
        return;
    }

} //End of getClientUserId

module.exports.getClientUserId = getClientUserId;