let $loginFormContainer = $('#loginFormContainer');
if ($loginFormContainer.length != 0) {
    //console.log('Login form detected. Binding event handling logic to form elements.');
    //If the jQuery object which represents the form element exists,
    //the following code will create a method to submit registration details
    //to server-side api when the #submitButton element fires the click event.
    $('#submitButton').on('click', function (event) {
        event.preventDefault();
        const baseUrl = 'http://ec2-52-4-181-141.compute-1.amazonaws.com:5000';
        let email = $('#emailInput').val();
        let password = $('#passwordInput').val();
        let webFormData = new FormData();
        webFormData.append('email', email);
        webFormData.append('password', password);
        axios({
            method: 'post',
            url: baseUrl + '/api/user/login',
            data: webFormData,
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(function (response) {
                //Inspect the object structure of the response object.
                //console.log('Inspecting the respsone object returned from the login web api');
                //console.dir(response);
                userData = response.data;
                if (userData.role_name == 'user') {
                    localStorage.setItem('token', userData.token);
                    localStorage.setItem('user_id', userData.user_id);
                    localStorage.setItem('role_name', userData.role_name);
                    window.location.replace('user/manage_submission.html');
                    return;
                }
                if (response.data.role_name == 'admin') {
                    localStorage.setItem('token', userData.token);
                    localStorage.setItem('user_id', userData.user_id);
                    localStorage.setItem('role_name', userData.role_name);
                    window.location.replace('admin/manage_users.html');
                    return;
                }
            })
            .catch(function (error) {
                // ---> Error Handling Remove
                // console.dir(response);
                
                //variables declared to be used later
                let errStatus;
                let errMsg;
                let notyErrMsg = 'Unable to login. Check your email and password';

                //check if the error's response exists
                if (error.response) {
                    //retrieve the http status code from the error response
                    errStatus = error.response.status;
                    //retrieve the error message specified through res.send
                    errMsg = error.response.data.errorMsg;

                    if (errStatus == 429) {
                        //notyErrMsg = 'You are making too many requests, please try again later!';
                        notyErrMsg = errMsg;
                    }
                }

                new Noty({
                    type: 'error',
                    layout: 'topCenter',
                    theme: 'sunset',
                    timeout: '6000',
                    text: notyErrMsg,
                }).show();

                //console.log("RV" + error.response.data.redirect);

                if (error.response.data.redirect) {
                    //Calls a function that is defined in 'err_redirect.js' that redirects user to a error page
                    redirectToErrPage(errStatus, errMsg);
                }
            });
    });

} //End of checking for $loginFormContainer jQuery object