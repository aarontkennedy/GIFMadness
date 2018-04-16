$(document).ready(function () {

    // this is an object that will essentially wrap the data/array of image
    // objects returned from GIPHY
    function GIPHYResponse() {
        this.giphyData = null;
        this.pictures = $("#pictures");
        this.stillStr = "original_still";
        this.animatedStr = "original";

        let self = this;

        // this will be listening to any images added to the document
        // if the images are clicked, toggle them from still to animated
        this.pictures.on("click", "img", function () {
            console.log($(this));

            if ($(this).attr("src") == $(this).attr("data-still")) {
                $(this).attr("src", $(this).attr("data-animated"));
            }
            else {
                $(this).attr("src", $(this).attr("data-still"));
            }
        });
    }

    // we must have clicked a new tag/button  
    // wrap the new object, delete old images and print the new ones
    GIPHYResponse.prototype.reset = function (giphyResponseData) {
        this.giphyData = giphyResponseData;
        this.pictures.empty();
        this.createImages();
    };

    // create the image, rating, and wrapping element
    GIPHYResponse.prototype.createIMG = function (index) {
        let imgContainer = $("<figure>");
        let img = $("<img>");
        //img.attr("data-index", index); // not needed?
        img.attr("src", this.giphyData[index].images[this.stillStr].url);
        img.attr("data-still", this.giphyData[index].images[this.stillStr].url);
        img.attr("data-animated", this.giphyData[index].images[this.animatedStr].url);
        img.attr("alt", this.giphyData[index].title);
        img.attr("title", this.giphyData[index].title);
        imgContainer.append(img);

        let figCaption = $("<figcaption>");
        figCaption.text(this.giphyData[index].rating.toUpperCase());
        figCaption.addClass("rating");
        imgContainer.append(figCaption);

        let favoriteHeart = $("<span>");
        favoriteHeart.html("&hearts;");
        favoriteHeart.addClass("favorite");
        favoriteHeart.attr("data-url",
            this.giphyData[index].images[this.animatedStr].url);
        favoriteHeart.attr("title", this.giphyData[index].title);
        imgContainer.append(favoriteHeart);

        imgContainer.appendTo("#pictures");
    }
    // run through all the resulting images and print/create
    GIPHYResponse.prototype.createImages = function () {
        for (let i = 0; i < this.giphyData.length; i++) {
            this.createIMG(i);
        }
    };

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
            //console.log(encodeURIComponent(tags[i]));
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




    // This is an object to store the custom tags input by users
    // It is using localStorage
    function CustomStorage(storageIdentifier) {
        this.storageAvailable = (typeof (Storage) !== "undefined");
        this.customTagKey = storageIdentifier;
        if (!this.storageAvailable) {
            console.log("LocalStorage not available to save custom tags.");
        }
        else {
            console.log("LocalStorage available to save custom tags.");
            // add the existing tags to the array
            let result = this.retrieve();
            if (result) {
                for (let i = 0; i < result.length; i++) {
                    tags.addElement(result[i]);
                }
            }
        }
    }

    CustomStorage.prototype.add = function (tag) {
        if (this.storageAvailable && tag) {
            let existingTags = this.retrieve();
            if (existingTags) {
                existingTags.push(tag);
            }
            else {
                existingTags = [tag];
            }
            localStorage.setItem(this.customTagKey,
                JSON.stringify(existingTags));
        }
    };

    CustomStorage.prototype.retrieve = function () {
        let results = null;
        if (this.storageAvailable) {
            //debugger
            results = JSON.parse(localStorage.getItem(this.customTagKey));
            console.log(`existing tags: ${results}`);
        }
        return results;
    };

    CustomStorage.prototype.reset = function () {
        if (this.storageAvailable) {
            localStorage.removeItem(this.customTagKey);
        }
    }

    let buttonStorage = new CustomStorage("GIFMadness" + "CustomButtons");


    // this is a class that can be used to toggle on and off those irritating
    // ratings
    function RatingsToggler() {
        this.element = $("#showRatings");

        let self = this;

        $("#showRatings").click(function (event) {
            event.preventDefault();
            console.log(event);
            $(".rating").toggle();  // why won't these work when I cache them?
        });
    }

    let toggler = new RatingsToggler();


    // we need to listen to the submit button and add any requested text as
    // tags to the array
    let customTagElement = $("#customTag");
    $("#submitButton").click(function (event) {
        console.log(customTagElement);
        event.preventDefault();
        if (customTagElement.val()) {
            tags.addElement(customTagElement.val());
            buttonStorage.add(customTagElement.val());
            customTagElement.val("");
        }
    });


    
    let favoritesStorage = new CustomStorage("GIFMadness" + "Favorites");
    //storage.reset();

    function listenForFavorites() {

        $("#pictures").on("click", ".favorite", function () {

            console.log($(this).attr("data-url"));

            let imgContainer = $("#favorites");
            let img = $("<img>");
            img.attr("src", $(this).attr("data-url"));
            img.attr("alt", $(this).attr("title"));
            img.attr("title", $(this).attr("title"));
            imgContainer.append(img);
        });
    };
    listenForFavorites();


});