// When encrypting a value, crypto scrambles it according to 
// 1. A secret key stored in the backend
// 2. A unique Initialization Vector(IV)
// The IV value is unique for each and every one encryption value and acts as a second key to access the value.
// To add an extra layer of safety and convenience, the IV value will be pre-pended to the encryption output,
// and extracted from the first 16 chracters when undergoing decryption.

// More info: https://stackoverflow.com/questions/36210123/storing-the-initialization-vector-separate-field

const crypto = require('crypto');
// Type of algorithm
const algorithm = 'aes-256-ctr';
// Encryption secret key
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'; //32 character key

// ---> Error Response, changed to explicit functions for more accurate stack trace

// Encrypt
const encrypt = function encrypt(text) {
    console.log("----ENCRYPT----");
    // Initialization vector (Unique value added to secret key, prevents a dictionary attack)
    var iv = crypto.randomBytes(16); //32 characters when translated from hex
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    console.log("To Encrypt:");
    console.log(text);
    console.log("IV Value:");
    console.log(iv.toString('hex'));
    const finalOutput = iv.toString('hex') + encrypted.toString('hex');
    return finalOutput;
};

// Encrypt email
const encryptEmail = function encryptEmail(email) {
    console.log("----ENCRYPT EMAIL----");
    // Initialization vector (Unique value added to secret key, prevents a dictionary attack)
    var iv = Buffer.from('9e03804636a8638b97604ea3528fcacd', 'hex');
    console.log("Email To Encrypt:");
    console.log(email);
    console.log("IV Value:");
    console.log(iv.toString('hex'));
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(email), cipher.final()]);
    return encrypted.toString('hex');;
}

// Decrypt
const decrypt = function decrypt(hash) {
    console.log("----DECRYPT----")
    var iv = hash.substring(0, 32);
    console.log("Derived IV Value:");
    console.log(iv);
    const content = hash.substring(32);
    console.log("To Decrypt:");
    console.log(content);
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(iv, 'hex'));
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(content, 'hex')), decipher.final()]);
    return decrpyted.toString();
};

// Decrypt email
const decryptEmail = function decryptEmail(emailEncrypted) {
    console.log("----DECRYPT EMAIL----")
    var iv = Buffer.from('9e03804636a8638b97604ea3528fcacd', 'hex');
    console.log("Derived IV Value:");
    console.log(iv);
    console.log("To Decrypt:");
    console.log(emailEncrypted);
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(emailEncrypted, 'hex')), decipher.final()]);
    return decrpyted.toString();
};

module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
module.exports.encryptEmail = encryptEmail;
module.exports.decryptEmail = decryptEmail;