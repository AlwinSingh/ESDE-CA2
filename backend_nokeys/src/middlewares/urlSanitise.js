// Sanitise URLs
const validator = require('validator');
// ReGex produced based off this post:
// https://stackoverflow.com/questions/7109143/what-characters-are-valid-in-a-url
// Allowed characters in url: 
// A to Z a to z  0 to 9
// - . _ ~ : / ? # [ ] @ ! $ & ' ( ) * + , ; % =
// Test values:
// ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~:/?#[]@!$&'()*+,;%=
// ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~:/?#[]@!$&\'()*+,;%=

const sanitiseURL = function sanitiseURL(value) {
    var result = validator.blacklist(value, '^A-Za-z0-9\\-\.\_\~\:\\/\?\#\[\\\]\@\!\$\&\'\(\\\)\*\+\,\;\%\=');
    return result;
}

module.exports.sanitiseURL = sanitiseURL;