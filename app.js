//javascript, jQuery
var xhr = $.get("http://api.giphy.com/v1/gifs/search?q=ryan+gosling&api_key=MSfEV1eyHtNS3mXorDXyqTQ7JB6jY8Pi&limit=5");
xhr.done(function (data) {
    console.log("success got data", data);
    for (let i = 0; i < data.data.length; i++) {
        console.log(data.data[i].images);
        $("#pictures").append($("<img>").attr("src",
            data.data[i].images["downsized_still"].url));
        $("#pictures").append($("<img>").attr("src",
            data.data[i].images["downsized"].url));
    }
});