function redirectToErrPage(errCode, errMsg) {
    //Redirects the user. The error.html page will read in the values via the URL parameters
    window.location = "../error.html?errCode=" + errCode + "&errMsg=" + errMsg;
}

//Front end validation of user
function validateJWTUser(userToken) {
    try { //Try-Catch to handle unexpected errors
        var jwt = userToken;

        var tokens = jwt.split(".");

        var jsonHeaderData = JSON.parse(atob(tokens[0])); //atob is a built in base 64 decoder
        var jsonPayloadData = JSON.parse(atob(tokens[1]));
        var isValid = true;

        if (jsonHeaderData.typ == 'JWT') { //Verifies  the token type
            if (jsonPayloadData.id) {
                //Verifies payload
                var userIdRegExp = RegExp(/^[0-9]*$/);

                if (userIdRegExp.test(jsonPayloadData.id)) {
                    if (jsonPayloadData.role) {
                        if (jsonPayloadData.role != "user" && jsonPayloadData.role != "admin") {
                            redirectToErrPage(403, "Not authorised to access this resource!");
                            isValid = false;
                        }
                    } else {
                        redirectToErrPage(403, "Not authorised to access this resource!");
                        isValid = false;
                    }
                } else {
                    redirectToErrPage(403, "Not authorised to access this resource!");
                    isValid = false;
                }
            } else {
                redirectToErrPage(403, "Not authorised to access this resource!");
                isValid = false;
            }
        } else {
            redirectToErrPage(403, "Not authorised to access this resource!");
            isValid = false;
        }

    } catch (error) {
        redirectToErrPage(403, 'You must be logged in to access this page!');
        isValid = false;
    }

    return isValid;
}

//Front end validation of admin
function validateJWTAdmin(userToken) {
    try { //Try-Catch to handle unexpected errors
        var jwt = userToken;

        var tokens = jwt.split(".");

        var jsonHeaderData = JSON.parse(atob(tokens[0])); //atob is a built in base 64 decoder
        var jsonPayloadData = JSON.parse(atob(tokens[1]));
        var isValid = true;

        if (jsonHeaderData.typ == 'JWT') { //Verifies  the token type
            if (jsonPayloadData.id) {
                //Verifies payload
                var userIdRegExp = RegExp(/^[0-9]*$/);

                if (userIdRegExp.test(jsonPayloadData.id)) {
                    if (jsonPayloadData.role) {
                        if (jsonPayloadData.role != "admin") {
                            redirectToErrPage(403, "Not authorised to access this resource!");
                            isValid = false;
                        }
                    } else {
                        redirectToErrPage(403, "Not authorised to access this resource!");
                        isValid = false;
                    }
                } else {
                    redirectToErrPage(403, "Not authorised to access this resource!");
                    isValid = false;
                }
            } else {
                redirectToErrPage(403, "Not authorised to access this resource!");
                isValid = false;
            }
        } else {
            redirectToErrPage(403, "Not authorised to access this resource!");
            isValid = false;
        }

    } catch (error) {
        redirectToErrPage(403, 'You must be logged in as an Administrator to access this page!');
        isValid = false;
    }

    return isValid;
}