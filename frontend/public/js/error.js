$(document).ready(function () {
    getURLParameters();
});

function getURLParameters() {
    var url_string = window.location.href;
    var url = new URL(url_string);
    var errCode = url.searchParams.get("errCode");
    var errMsg = url.searchParams.get("errMsg");

    $(".errorCode").text(errCode);
    $(".errorText").text(errMsg);
}