$(document).ready(function () {
    //Once page is ready, it verifies if the user is logged in
    try {
        //getOneUserAPIGateway();

        $('.getUserProfile').on('click', function (event) {
            var myToken = $(".authToken").val();
            var usersId = $(".userId").val();

            if (myToken.length > 0 && usersId.length > 0) {
                getOneUserAPIGateway(myToken, usersId);
            } else {
                new Noty({
                    type: 'error',
                    timeout: '6000',
                    layout: 'topCenter',
                    theme: 'sunset',
                    text: 'Unable retrieve profile data',
                }).show();
            }

        });

    } catch (error) {
        console.log(error);
        redirectToErrPage(404, "A resource to process your action was not found!");
    }
});


function mapper(data) {
    let S = "S";
    let SS = "SS";
    let NN = "NN";
    let NS = "NS";
    let BS = "BS";
    let BB = "BB";
    let N = "N";
    let BOOL = "BOOL";
    let NULL = "NULL";
    let M = "M";
    let L = "L";
    
    if (isObject(data)) {
        let keys = Object.keys(data);
        while (keys.length) {
            let key = keys.shift();
            let types = data[key];
    
            if (isObject(types) && types.hasOwnProperty(S)) {
                data[key] = types[S];
            } else if (isObject(types) && types.hasOwnProperty(N)) {
                data[key] = parseFloat(types[N]);
            } else if (isObject(types) && types.hasOwnProperty(BOOL)) {
                data[key] = types[BOOL];
            } else if (isObject(types) && types.hasOwnProperty(NULL)) {
                data[key] = null;
            } else if (isObject(types) && types.hasOwnProperty(M)) {
                data[key] = mapper(types[M]);
            } else if (isObject(types) && types.hasOwnProperty(L)) {
                data[key] = mapper(types[L]);
            } else if (isObject(types) && types.hasOwnProperty(SS)) {
                data[key] = types[SS];
            } else if (isObject(types) && types.hasOwnProperty(NN)) {
                data[key] = types[NN];
            } else if (isObject(types) && types.hasOwnProperty(BB)) {
                data[key] = types[BB];
            } else if (isObject(types) && types.hasOwnProperty(NS)) {
                data[key] = types[NS];
            } else if (isObject(types) && types.hasOwnProperty(BS)) {
                data[key] = types[BS];
            }
        }
    }

    return data;
}

function isObject(value) {
    return typeof value === "object" && value !== null;
}

function populateHtmlComponents(data) {
    $('#fullNameOutput').text(data.full_name);
    $('#emailOutput').text(data.email);
}

function getOneUserAPIGateway(token, userid) {
    const awsBaseUrl = "https://4n2v8bawdl.execute-api.us-east-1.amazonaws.com/user-profile-cognito";

    axios({
        headers: {
            'user': userid,
            'Content-Type': 'application/json',
            'Authorization': token
          },
          /*data: {
            "user":"100"
        },*/
        method: 'POST',
        url: awsBaseUrl,
    })
        .then(function (response) {
            //Using the following to inspect the response.data data structure
            //before deciding the code which dynamically populate the elements with data.
            // ---> Error Handling Remove
            // console.dir(response.data);
            const record = response.data;
            //console.log("RESPONSE " +response.data);
            populateHtmlComponents(mapper(record[0]));
        })
        .catch(function (error) {
            // ---> Error Handling Remove
            // console.dir(response);
            //console.log("ERROR " +error);
            new Noty({
                type: 'error',
                timeout: '6000',
                layout: 'topCenter',
                theme: 'sunset',
                text: 'Unable retrieve profile data',
            }).show();

            //variables declared to be used later
            let errStatus;
            let errMsg

            //check if the error's response exists
            if (error.response) {
                //retrieve the http status code from the error response
                errStatus = error.response.status;
                //retrieve the error message specified through res.send
                errMsg = error.response.data.errorMsg;
            }

            //Calls a function that is defined in 'err_redirect.js' that redirects user to a error page
            //redirectToErrPage(errStatus, errMsg);
        });
} //End of getOneUser