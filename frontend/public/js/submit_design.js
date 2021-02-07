$(document).ready(function () {
    //Once page is ready, it verifies if the user is logged in
    try {
        validateJWTUser(localStorage.getItem('token'));
    } catch (error) {
        redirectToErrPage(404, "A resource to process your action was not found!");
    }
});

function validateInputField(inputField) {
    var inputRegex = new RegExp(/^(\w|\s)*[a-zA-Z]+(\w|\s)*$/);

    var regexTest = inputRegex.test(inputField);

    return regexTest;
}

let $submitDesignFormContainer = $('#submitDesignFormContainer');
if ($submitDesignFormContainer.length != 0) {
    //console.log('Submit design form detected. Binding event handling logic to form elements.');
    //If the jQuery object which represents the form element exists,
    //the following code will create a method to submit design details
    //to server-side api when the #submitButton element fires the click event.
    $('#submitButton').on('click', function (event) {
        event.preventDefault();
        const baseUrl = 'http://esde-loadbalancer-1886701568.us-east-1.elb.amazonaws.com';
        //let userId = localStorage.getItem('user_id');
        let userToken = localStorage.getItem('token');
        let designTitle = $('#designTitleInput').val();
        let designDescription = $('#designDescriptionInput').val();


        if (validateInputField(designTitle) && validateInputField(designDescription)) {
            let webFormData = new FormData();
            webFormData.append('designTitle', designTitle);
            webFormData.append('designDescription', designDescription);
            // HTML file input, chosen by user
            // var mimeType=files[0].type;
            // --> XXE Solution
            // Enforce .png file only submissions
            if (document.getElementById('fileInput').files[0].type != 'image/png') {
                new Noty({
                    type: 'error',
                    timeout: '6000',
                    layout: 'topCenter',
                    theme: 'sunset',
                    text: 'Unable to submit design file. Invalid file type!',
                }).show();
            } else {
                webFormData.append("file", document.getElementById('fileInput').files[0]);
                axios({
                    method: 'post',
                    url: baseUrl + '/api/user/process-submission',
                    data: webFormData,
                    headers: { 'Content-Type': 'multipart/form-data', 'Authorization': userToken }
                })
                    // To fix this, use the .attr code!
                    .then(function (response) {
                        Noty.overrideDefaults({
                            callbacks: {
                                onTemplate: function () {
                                    if (this.options.type === 'systemresponse') {
                                        // Old Code:
                                        // this.barDom.innerHTML = '<div class="my-custom-template noty_body">';
                                        // this.barDom.innerHTML += '<div class="noty-header">Message</div>';
                                        // this.barDom.innerHTML += '<p class="noty-message-body">' + this.options.text + '</p>';
                                        // this.barDom.innerHTML += '<img src="' + this.options.imageURL + '">';
                                        // this.barDom.innerHTML += '<div>';

                                        // Fix for vulnerability:
                                        $var1 = $(this.barDom);
                                        $var1.empty();
                                        $var1.append($('<div></div>').addClass('my-custom-template noty_body'));
                                        $var1.append($('<div></div>').addClass('noty-header').text("Message"));
                                        $var1.append($('<p></p>').addClass('noty-message-body').text(this.options.text));
                                        $var1.append($('<img></img>').attr('src', this.options.imageURL));
                                        $var1.append($('<div></div>'));
                                    }
                                }
                            }
                        })

                        new Noty({
                            type: 'systemresponse',
                            layout: 'topCenter',
                            timeout: '5000',
                            text: response.data.message,
                            imageURL: response.data.image_url
                        }).show();
                    })
                    .catch(function (error) {
                        // ---> Error Handling Remove
                        // console.dir(response);
                        new Noty({
                            type: 'error',
                            timeout: '6000',
                            layout: 'topCenter',
                            theme: 'sunset',
                            text: 'Unable to submit design file.',
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
            }
        } else {
            new Noty({
                type: 'error',
                timeout: '6000',
                layout: 'topCenter',
                theme: 'sunset',
                text: 'Your input for the designTitle or designDescription was not accepted!',
            }).show();

            return false;
        }
    });


} //End of checking for $submitDesignFormContainer jQuery object
