$(document).ready(function () {
    //Once page is ready, it verifies if the user is logged in
    try {
        validateJWTUser(localStorage.getItem('token'));
    } catch (error) {
        redirectToErrPage(404, "A resource to process your action was not found!");
    }
});

let $searchDesignFormContainer = $('#searchDesignFormContainer');
if ($searchDesignFormContainer.length != 0) {
    //console.log('Search design form detected in user manage submission interface. Binding event handling logic to form elements.');
    //If the jQuery object which represents the form element exists,
    //the following code will create a method to send key-value pair information to do record searching
    //to server-side api when the #submitButton element fires the click event.
    $('#submitButton').on('click', function (event) {
        event.preventDefault();
        const baseUrl = 'http://esde-loadbalancer-1886701568.us-east-1.elb.amazonaws.com';
        let searchInput = $('#searchInput').val();
        //let userId = localStorage.getItem('user_id');
        let userToken = localStorage.getItem('token');

        axios({
            headers: {
                //'user': userId,
                'Authorization': userToken
            },
            method: 'get',
            url: baseUrl + '/api/user/process-search-design/1/' + searchInput,
        })
            .then(function (response) {
                //Using the following to inspect the response.data data structure
                //before deciding the code which dynamically generates cards.
                //Each card describes a design record.
                //console.dir(response.data);
                const records = response.data.file_data;
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
                    let $card = $('<div></div>').addClass('card').attr('style', 'width: 18rem;');
                    $card.append($('<img></img>').addClass('card-img-top').addClass('app_thumbnail').attr('src', record.cloudinary_url));
                    let $cardBody = $('<div></div>').addClass('card-body');
                    let $editDesignButtonBlock = $('<div></div>').addClass('col-md-2 float-right');
                    $editDesignButtonBlock.append($('<a>Update</a>').addClass('btn btn-primary').attr('href', 'update_design.html?id=' + record.file_id));
                    $cardBody.append($editDesignButtonBlock);
                    $cardBody.append($('<h5></h5>').addClass('card-title').text(record.design_title));
                    $cardBody.append($('<p></p>').addClass('card-text').text(record.design_description));
                    $card.append($cardBody);
                    //After preparing all the necessary HTML elements to describe the file data,
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
    //I have hard code 3 buttons for the manage-submission interface (user role)
    //to cut down the JavaScript code for this file.
    //If the jQuery object which represents the form element exists,
    //the following code will create a method to make a HTTP GET
    //to server-side api.
    function clickHandlerForPageButton(event) {
        event.preventDefault();
        const baseUrl = 'http://esde-loadbalancer-1886701568.us-east-1.elb.amazonaws.com';
        //let userId = localStorage.getItem('user_id');
        let userToken = localStorage.getItem('token');
        let pageNumber = $(event.target).text().trim();
        let searchInput = $('#searchInput').val();
        //console.log("Page: " + pageNumber);
        axios({
            headers: {
                //'user': userId,
                'Authorization': userToken
            },
            method: 'get',
            url: baseUrl + '/api/user/process-search-design/' + pageNumber + '/' + searchInput,
        })
            .then(function (response) {
                //Using the following to inspect the response.data data structure
                //before deciding the code which dynamically generates cards.
                //Each card describes a design record.
                //console.dir(response.data);
                const records = response.data.file_data;
                const totalNumOfRecords = response.data.total_number_of_records;
                //Find the main container which displays page number buttons
                let $pageButtonContainer = $('#pagingButtonBlock');
                //Find the main container which has the id, dataBlock
                let $dataBlockContainer = $('#dataBlock');
                $dataBlockContainer.empty();
                $pageButtonContainer.empty();
                for (let index = 0; index < records.length; index++) {
                    let record = records[index];
                    let $card = $('<div></div>').addClass('card').attr('style', 'width: 18rem;');
                    $card.append($('<img></img>').addClass('card-img-top').addClass('app_thumbnail').attr('src', record.cloudinary_url));
                    let $cardBody = $('<div></div>').addClass('card-body');
                    let $editDesignButtonBlock = $('<div></div>').addClass('col-md-2 float-right');
                    $editDesignButtonBlock.append($('<a>Update</a>').addClass('btn btn-primary').attr('href', 'update_design.html?id=' + record.file_id));
                    $cardBody.append($editDesignButtonBlock);
                    $cardBody.append($('<h5></h5>').addClass('card-title').text(record.design_title));
                    $cardBody.append($('<p></p>').addClass('card-text').text(record.design_description));
                    $card.append($cardBody);
                    //After preparing all the necessary HTML elements to describe the file data,
                    //I used the code below to insert the main parent element into the div element, dataBlock.
                    $dataBlockContainer.append($card);
                    $dataBlockContainer.append($('<h5></h5>'));
                } //End of for loop
                let totalPages = Math.ceil(totalNumOfRecords / 4);
                for (let count = 1; count <= totalPages; count++) {

                    $pageButtonContainer.append($('<button class="btn btn-primary btn-sm"></button>').text(count).on('click', clickHandlerForPageButton));
                }
            })
            .catch(function (error) {
                // ---> Error Handling Remove
                // console.dir(response);
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
} //End of checking for $searchDesignFormContainer jQuery object