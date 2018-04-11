const tags = [
    "Macho Man",
    "Ultimate Warrior",
    "Mil Muertes",
    "Pentagon Dark",
    "Joey Ryan",
    'Marty "The Moth" Martinez',
    "Bray Wyatt",
    "Dalton Castle",
    "Alexa Bliss",
    "Rhonda Rousey",
    "Hulk Hogan",
    "John Cena",
    "Adam Cole",
    "Catrina",
    "Andre the Giant",
    "Stone Cold Steve Austin"];


for (let i = 0; i < tags.length; i++) {
    $("<button>").text(tags[i]+" ").addClass("btn").addClass("btn-default"
    ).addClass("btn-primary").appendTo($("#tags"));
    console.log(encodeURIComponent(tags[i]));
}


//javascript, jQuery
// looks like the format is a string with each part separate by a +
// ie. ryan+gosling
var searchTerm = encodeURIComponent("Macho Man promo");
var xhr = $.get(`https://api.giphy.com/v1/gifs/search?q=${searchTerm}&api_key=MSfEV1eyHtNS3mXorDXyqTQ7JB6jY8Pi&limit=15`);
xhr.done(function (data) {
    console.log("success got data", data);
    for (let i = 0; i < data.data.length; i++) {
        console.log(data.data[i]);
        $("#pictures").append($("<img>").attr("src",
            data.data[i].images["downsized_still"].url));
        $("#pictures").append($("<img>").attr("src",
            data.data[i].images["downsized"].url));
    }
});