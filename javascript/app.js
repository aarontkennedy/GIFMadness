$(document).ready(function () {

    function GIPHYResponse() {
        this.giphyData = null;
        this.pictures = $("#pictures");
        this.stillStr = "downsized_still";
        this.animatedStr = "downsized";

        let self = this;

        this.pictures.on("click", "img", function () {
            console.log($(this));
            let imageIDnumber = parseInt($(this).attr("id").substring(3));

            if ($(this).attr("src") ==
                self.giphyData[imageIDnumber].images[self.stillStr].url) {
                $(this).attr("src",
                    self.giphyData[imageIDnumber].images[self.animatedStr].url);
            }
            else {
                $(this).attr("src",
                    self.giphyData[imageIDnumber].images[self.stillStr].url);
            }

        });
    }

    GIPHYResponse.prototype.reset = function (giphyResponseData) {
        this.giphyData = giphyResponseData;
        this.pictures.empty();
        this.createImages();
    }

    GIPHYResponse.prototype.createIMG = function (id, src, rating) {
        let imgContainer = $("<figure>");
        imgContainer.append($("<img>").attr("id", id).attr("src", src));
        imgContainer.append($("<figcaption>").text(rating.toUpperCase()).addClass("rating"));
        imgContainer.appendTo("#pictures");
    }
    GIPHYResponse.prototype.createImages = function () {
        for (let i = 0; i < this.giphyData.length; i++) {
            this.createIMG(`gif${i}`,
                this.giphyData[i].images[this.stillStr].url,
                this.giphyData[i].rating
            );
        }
    }

    let giphyObject = new GIPHYResponse();

    // initial array of tags for the buttons
    let tags = [
        "Macho Man",
        "Ultimate Warrior",
        "Mil Muertes",
        "Pentagon Dark",
        "Joey Ryan",
        "Bray Wyatt",
        "Alexa Bliss",
        "Rhonda Rousey",
        "Hulk Hogan",
        "John Cena",
        "Andre the Giant",
        "Stone Cold Steve Austin"];

    // Create a button from a tag
    tags.createButton = function (tagText) {
        $("<button>").text(tagText + " ").addClass("btn btn-primary").appendTo($("#tags"));
    };

    // Initialize the page by creating a button for each tag
    // in the array 
    // Start listening for clicks on the buttons
    tags.init = function () {
        for (let i = 0; i < tags.length; i++) {
            this.createButton(tags[i]);
            console.log(encodeURIComponent(tags[i]));
        }
        this.listenForClicks();
    };

    // add a new tag to the array and add it to the DOM
    tags.addElement = function (tagText) {
        this.push(tagText);
        this.createButton(tagText);
    };

    // listen to clicks on the buttons and request
    // from GIPHY the gifs related to the button text
    tags.listenForClicks = function () {

        // must listen to #tags div to account for dynamically
        // created buttons
        $("#tags").on("click", ".btn", function () {

            console.log($(this).text());

            let searchTerm = encodeURIComponent($(this).text());
            let requestedGIFS = "10";
            let queryURL = `https://api.giphy.com/v1/gifs/search?q=${searchTerm}&api_key=MSfEV1eyHtNS3mXorDXyqTQ7JB6jY8Pi&limit=${requestedGIFS}`;

            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function (response) {
                console.log("success got data", response);
                giphyObject.reset(response.data);
            });
        });
    };

    tags.init();


    function RatingsToggler() {
        this.element = $("#showRatings");
        this.showRatingsString = "Show Ratings";

        let self = this;

        $("#showRatings").click(function (event) {
            event.preventDefault();
            console.log(event);

            if (self.element.text() == self.showRatingsString) {
                self.element.text("Hide Ratings");
                $(".rating").show();
            }
            else {
                self.element.text(self.showRatingsString);
                $(".rating").hide();
            }
        });
    }

    let toggler = new RatingsToggler();



});