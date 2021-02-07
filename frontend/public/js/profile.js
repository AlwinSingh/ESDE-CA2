$(document).ready(function () {
    //Once page is ready, it verifies if the user is logged in
    try {
        validateJWTUser(localStorage.getItem('token'));
    } catch (error) {
        redirectToErrPage(404, "A resource to process your action was not found!");
    }
});

let $profileContainer = $('#profileContainer');
if ($profileContainer.length != 0) {
    //console.log('Profile page is detected. Binding event handling logic to form elements.');
    $('#backButton').on("click", function (e) {
        e.preventDefault();
        window.history.back();
    });

    function getOneUser() {

        const baseUrl = 'http://esde-loadbalancer-1886701568.us-east-1.elb.amazonaws.com';

        //Obtain jwt token from local storage
        let userToken = localStorage.getItem('token');

        axios({
            headers: {
                'Authorization': userToken,
                //'user': userId
            },
            method: 'get',
            url: baseUrl + '/api/user',
        })
            .then(function (response) {
                //Using the following to inspect the response.data data structure
                //before deciding the code which dynamically populate the elements with data.
                // ---> Error Handling Remove
                // console.dir(response.data);
                const record = response.data.user_data;
                $('#fullNameOutput').text(record.full_name);
                $('#emailOutput').text(record.email);
            })
            .catch(function (error) {
                // ---> Error Handling Remove
                // console.dir(response);
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
                redirectToErrPage(errStatus, errMsg);
            });
    } //End of getOneUser
    //Call getOneUser function to do a GET HTTP request on an API to retrieve one user record
    getOneUser();
} //End of checking for $profileContainer jQuery object