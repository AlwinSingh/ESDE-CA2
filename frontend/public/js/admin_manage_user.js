$(document).ready(function () {
    //Once page is ready, it verifies if the user is logged in
    try {
        validateJWTAdmin(localStorage.getItem('token'));
    } catch (error) {
        redirectToErrPage(404, "A resource to process your action was not found!");
    }
});

let $searchDesignFormContainer = $('#searchUserFormContainer');
if ($searchDesignFormContainer.length != 0) {
    //console.log('Search user form detected in manage user interface. Binding event handling logic to form elements.');
    //If the jQuery object which represents the form element exists,
    //the following code will create a method to submit search parameters
    //to server-side api when the #submitButton element fires the click event.
    $('#submitButton').on('click', function (event) {
        event.preventDefault();
        const baseUrl = 'http://esde-loadbalancer-1886701568.us-east-1.elb.amazonaws.com';
        let searchInput = $('#searchInput').val();

        let userId = localStorage.getItem('user_id');

        //Obtain jwt token from local storage
        let userToken = localStorage.getItem('token');

        axios({
            headers: {
                //Modify this will affect the checkUserFn.js middleware file at the backend.
                'user': userId,
                'Authorization': userToken
            },
            method: 'get',
            url: baseUrl + '/api/user/process-search-user/1/' + searchInput,
        })
            .then(function (response) {
                //Using the following to inspect the response.data data structure
                //before deciding the code which dynamically generates cards.
                //Each card describes a design record.
                //console.dir(response.data);
                const records = response.data.user_data;
                const totalNumOfRecords = response.data.total_number_of_records;
                //Find the main container which displays page number buttons
                let $pageButtonContainer = $('#pagingButtonBlock');
                //Find the main container which has the id, dataBlock
                let $dataBlockContainer = $('#dataBlock');
                $dataBlockContainer.empty();
                $pageButtonContainer.empty();
                if (records.length == 0) {
                    new Noty({
                        type: 'information',
                        layout: 'topCenter',
                        timeout: '5000',
                        theme: 'sunset',
                        text: 'No submission records found.',
                    }).show();
                }
                for (let index = 0; index < records.length; index++) {
                    let record = records[index];
                    // console.log(record.cloudinary_url);
                    let $card = $('<div></div>').addClass('card').attr('style', 'width: 18rem;');
                    let $cardBody = $('<div></div>').addClass('card-body');
                    $cardBody.append($('<h5></h5>').addClass('card-title').text(record.full_name));
                    $editUserButtonBlock = $('<div></div>').addClass('col-md-2 float-right');
                    $editUserButtonBlock.append($('<a>Manage</a>').addClass('btn btn-primary').attr('href', 'update_user.html?id=' + record.user_id));
                    $cardBody.append($editUserButtonBlock);

                    $cardBody.append($('<p></p>').addClass('card-text').text(record.email));
                    if (record.role_name == 'admin') {
                        $cardBody.append($('<img></img>').attr({ 'src': '../images/admin.png', 'width': '50' }).addClass('text-right'));
                    }
                    $card.append($cardBody);
                    //After preparing all the necessary HTML elements to describe the user data,
                    //I used the code below to insert the main parent element into the div element, dataBlock.
                    $dataBlockContainer.append($card);
                    $dataBlockContainer.append($('<h5></h5>'));
                } //End of for loop
                let totalPages = Math.ceil(totalNumOfRecords / 4);

                for (let count = 1; count <= totalPages; count++) {

                    let $button = $(`<button class="btn btn-primary btn-sm" />`);
                    $button.text(count);
                    $button.click(clickHandlerForPageButton);

                    $pageButtonContainer.append($button);
                } //End of for loop to add page buttons

            }).catch(function (error) {
                // ---> Error Handling Remove
                // console.dir(response);
                new Noty({
                    type: 'error',
                    layout: 'topCenter',
                    timeout: '5000',
                    theme: 'sunset',
                    text: 'Unable to search',
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

    function clickHandlerForPageButton(event) {
        event.preventDefault();
        const baseUrl = 'http://esde-loadbalancer-1886701568.us-east-1.elb.amazonaws.com';
        //let userId = localStorage.getItem('user_id');
        let userToken = localStorage.getItem('token');
        let pageNumber = $(event.target).text().trim();
        let searchInput = $('#searchInput').val();
        // console.log('Checking the button page number which raised the click event : ', pageNumber);
        axios({
            headers: {
                //'user': userId
                'Authorization': userToken
            },
            method: 'get',
            url: baseUrl + '/api/user/process-search-user/' + pageNumber + '/' + searchInput,
        })
            .then(function (response) {
                //Using the following to inspect the response.data data structure
                //before deciding the code which dynamically generates cards.
                //Each card describes a design record.
                //console.dir(response.data);
                const records = response.data.user_data;
                const totalNumOfRecords = response.data.total_number_of_records;
                //Find the main container which displays page number buttons
                let $pageButtonContainer = $('#pagingButtonBlock');
                //Find the main container which has the id, dataBlock
                let $dataBlockContainer = $('#dataBlock');
                $dataBlockContainer.empty();
                $pageButtonContainer.empty();
                for (let index = 0; index < records.length; index++) {
                    let record = records[index];
                    // console.log(record.cloudinary_url);
                    let $card = $('<div></div>').addClass('card').attr('style', 'width: 18rem;');
                    let $cardBody = $('<div></div>').addClass('card-body');
                    $cardBody.append($('<h5></h5>').addClass('card-title').text(record.full_name));
                    $editUserButtonBlock = $('<div></div>').addClass('col-md-2 float-right');
                    $editUserButtonBlock.append($('<a>Manage</a>').addClass('btn btn-primary').attr('href', 'update_user.html?id=' + record.user_id));
                    $cardBody.append($editUserButtonBlock);
                    $cardBody.append($('<p></p>').addClass('card-text').text(record.email));
                    if (record.role_name == 'admin') {
                        $cardBody.append($('<img></img>').attr({ 'src': '../images/admin.png', 'widthc': '50' }).addClass('text-right'));
                    }
                    $card.append($cardBody);
                    //After preparing all the necessary HTML elements to describe the file data,
                    //I used the code below to insert the main parent element into the div element, dataBlock.
                    $dataBlockContainer.append($card);
                    $dataBlockContainer.append($('<h5></h5>'));
                } //End of for loop
                let totalPages = Math.ceil(totalNumOfRecords / 4);
                // console.log(totalPages);
                for (let count = 1; count <= totalPages; count++) {

                    $pageButtonContainer.append($('<button class="btn btn-primary btn-sm"></button>').text(count).on('click', clickHandlerForPageButton));
                }
            })
            //Changed from response to 'error'
            .catch(function (error) {
                // ---> Error Handling Remove
                // console.dir(response);
                //console.log(error);
                new Noty({
                    type: 'error',
                    layout: 'topCenter',
                    theme: 'sunset',
                    text: 'Unable to search',
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

    } //End of clickHandlerForPageButton
} //End of checking for $searchUserFormContainer jQuery object
