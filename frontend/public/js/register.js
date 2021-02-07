let $registerFormContainer = $('#registerFormContainer');
if ($registerFormContainer.length != 0) {
    //console.log('Registration form detected. Binding event handling logic to form elements.');
    //If the jQuery object which represents the form element exists,
    //the following code will create a method to submit registration details
    //to server-side api when the #submitButton element fires the click event.
    $('#submitButton').on('click', function (event) {
        event.preventDefault();
        const baseUrl = 'http://esde-loadbalancer-1886701568.us-east-1.elb.amazonaws.com';
        let fullName = $('#fullNameInput').val();
        let email = $('#emailInput').val();
        let password = $('#passwordInput').val();

        let passwordCheck = validatePassword(password);
        let emailCheck = validateEmail(email);
        let nameCheck = validateUsername(fullName);

        if (passwordCheck && emailCheck && nameCheck) {
            //resetForm();

            let webFormData = new FormData();
            webFormData.append('fullName', fullName);
            webFormData.append('email', email);
            webFormData.append('password', password);
            axios({
                method: 'post',
                url: baseUrl + '/api/user/register',
                data: webFormData,
                headers: { 'Content-Type': 'multipart/form-data' }
            })
                .then(function (response) {
                    //Handle success
                    // ---> Error Handling Remove
                    // console.dir(response);
                    new Noty({
                        type: 'success',
                        timeout: '6000',
                        layout: 'topCenter',
                        theme: 'bootstrap-v4',
                        text: 'You have registered. Please <a href="login.html" class=" class="btn btn-default btn-sm" >Login</a>',
                    }).show();
                })
                .catch(function (error) {
                    //Handle error
                    // ---> Error Handling Remove
                    // console.dir(response);
                    //variables declared to be used later
                    let errStatus;
                    let errMsg;
                    let notyErrMsg = 'Unable to register.';

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
                        timeout: '6000',
                        type: 'error',
                        layout: 'topCenter',
                        theme: 'sunset',
                        text: notyErrMsg,
                    }).show();

                    //Calls a function that is defined in 'err_redirect.js' that redirects user to a error page
                    //redirectToErrPage(errStatus, errMsg);
                });
        } else {

            //Retrieves the boolean value from the regex test and updates the input form label accordingly for better user experience
            if (!passwordCheck) {
                $(".passwordLabel").text('Your Password (Not Strong Enough)').addClass('text-danger');
            } else {
                $(".passwordLabel").removeClass('text-danger');
            }

            if (!emailCheck) {
                $(".emailLabel").text('Your email (Invalid)').addClass('text-danger');
            } else {
                $(".emailLabel").removeClass('text-danger');
            }

            if (!nameCheck) {
                $(".nameLabel").text('Your name (Invalid)').addClass('text-danger');
            } else {
                $(".nameLabel").removeClass('text-danger');
            }

            return false;
        }
    });

} //End of checking for $registerFormContainer jQuery object


//Functions for whitelisting of input values through Regular Expression
function validatePassword(userPass) {
    var regex = new RegExp(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8,})$/);
    //var userPass = $("#passwordInput").val();

    var regexTest = regex.test(userPass);

    return regexTest;
}

function validateEmail(userEmail) {
    var regex = new RegExp(/(?!.*[\.]{2})^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/);

    var regexTest = regex.test(userEmail);

    return regexTest;
}

function validateUsername(userName) {
    var regex = new RegExp(/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/);

    var regexTest = regex.test(userName);

    return regexTest;
}

function resetForm() {
    $(".passwordLabel").text('Your Password').removeClass('text-danger');
    $(".emailLabel").text('Your email').removeClass('text-danger');
    $(".nameLabel").text('Your name').removeClass('text-danger');
    $("#registerFormContainer")[0].reset();
}