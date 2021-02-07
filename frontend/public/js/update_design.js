let $updateDesignFormContainer = $('#updateDesignFormContainer');
if ($updateDesignFormContainer.length != 0) {
    //console.log('Update Design form is detected. Binding event handling logic to form elements.');
    //If the jQuery object which represents the form element exists,
    //the following code will create a method to submit design details
    //to server-side api when the #submitButton element fires the click event.
    $('#submitButton').on('click', function (event) {
        event.preventDefault();
        const baseUrl = 'http://esde-loadbalancer-1886701568.us-east-1.elb.amazonaws.com';
        //Collect fileId value from the input element, fileIdInput (hidden input element)
        let fileId = $('#fileIdInput').val();
        //Obtain jwt token from local storage
        let userToken = localStorage.getItem('token');
        //Collect design title and description input
        let designTitle = $('#designTitleInput').val();
        let designDescription = $('#designDescriptionInput').val();
        //Create a FormData object to build key-value pairs of information before
        //making a PUT HTTP request.
        let webFormData = new FormData();
        webFormData.append('designTitle', designTitle);
        webFormData.append('designDescription', designDescription);
        webFormData.append('fileId', fileId);
        axios({
            method: 'put',
            url: baseUrl + '/api/user/design/',
            data: webFormData,
            headers: { 'Content-Type': 'multipart/form-data', 'Authorization': userToken }
        })
            .then(function (response) {
                new Noty({
                    type: 'success',
                    layout: 'topCenter',
                    theme: 'sunset',
                    timeout: '5000',
                    text: 'Updated design information.',
                }).show();
            })
            .catch(function (error) {
                // ---> Error Handling Remove
                // console.dir(response);
                new Noty({
                    type: 'error',
                    layout: 'topCenter',
                    theme: 'sunset',
                    timeout: '6000',
                    text: 'Unable to update.',
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
    });
    $('#backButton').on("click", function (e) {
        e.preventDefault();
        window.history.back();
    });

    function getOneData() {
        const baseUrl = 'http://esde-loadbalancer-1886701568.us-east-1.elb.amazonaws.com';
        //Get the fileId information from the web browser URL textbox
        let query = window.location.search.substring(1);
        let arrayData = query.split("=");
        let fileId = arrayData[1];
        // ---> Error Handling Remove
        // console.dir('Obtained file id from URL : ', fileId);
        //let userId = localStorage.getItem('user_id');

        let userToken = localStorage.getItem('token');

        axios({
            headers: {
                'Authorization': userToken
            },
            method: 'get',
            url: baseUrl + '/api/user/design/' + fileId,
        })
            .then(function (response) {
                //Using the following to inspect the response.data data structure
                //before deciding the code which dynamically populate the elements with data.
                // ---> Error Handling Remove
                // console.dir(response.data);
                const record = response.data.file_data;
                $('#designTitleInput').val(record.design_title).focus();

                $('#fileIdInput').val(record.file_id);
                $('#designDescriptionInput').val(record.design_description).focus();
                //console.log("CLOUDINARY URL: " + record.cloudinary_url);
                $('#designImage').attr('src', record.cloudinary_url).focus();
            })
            .catch(function (error) {
                // ---> Error Handling Remove
                // console.dir(response);
                new Noty({
                    type: 'error',
                    timeout: '6000',
                    layout: 'topCenter',
                    theme: 'sunset',
                    text: 'Unable retrieve file data',
                }).show();
                //Retrieve error details

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

    } //End of getOneData
} //End of checking for $updateDesignFormContainer jQuery object

$(document).ready(function () {
    //Once page is ready, it verifies if the user is logged in
    try {
        var isUserValid = validateJWTUser(localStorage.getItem('token'));

        if (isUserValid) {
            //console.log('run')
            //Call getOneData function to do a GET HTTP request on an API to retrieve one user record
            getOneData(); //Call getOneData to begin populating the form input controls with the existing record information.
        } else {
            return false;
        }

    } catch (error) {
        redirectToErrPage(404, "A resource to process your action was not found!");
    }
});