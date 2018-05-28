$(document).ready(function () {

    // this is an object that will handle the data/array of image
    // objects returned from GIPHY
    function GIPHYResponse() {
        this.pictures = $("#pictures");
        this.stillStr = "original_still";
        this.animatedStr = "original";

        let self = this;

        // this will be listening to any images added to the document
        // if the images are clicked, toggle them from still to animated
        this.pictures.on("click", "img", function () {
            let thisImage = $(this);
            let parentFigure = thisImage.parent();
            if (thisImage.attr("src") == thisImage.attr("data-still")) {
                parentFigure.addClass("loading");
                
                let animated = new Image();
                animated.src = thisImage.attr("data-animated");
                animated.onload = function() {
                    parentFigure.removeClass("loading");
                    thisImage.attr("src", thisImage.attr("data-animated"));
                };
            }
            else {
                thisImage.attr("src", thisImage.attr("data-still"));
            }
        });
    }

    // clear existing pictures
    GIPHYResponse.prototype.clear = function () {
        this.pictures.empty();
    };
    // run through all the resulting images and print/create
    GIPHYResponse.prototype.createImages = function (giphyData) {
        for (let i = 0; i < giphyData.length; i++) {
            this.createIMG(giphyData[i]);
        }
    };
    // create the image, rating, and wrapping element
    // this function has a lot to do to actually display an image
    // i am creating a figure with an image, figcaption, and heart
    // inside it
    GIPHYResponse.prototype.createIMG = function (giphyImageData) {
        let imgContainer = $("<figure>");
        let img = $("<img>");
        //img.attr("data-index", index); // not needed?
        img.attr("src", giphyImageData.images[this.stillStr].url);
        img.attr("data-still", giphyImageData.images[this.stillStr].url);
        img.attr("data-animated", giphyImageData.images[this.animatedStr].url);
        img.attr("alt", giphyImageData.title);
        img.attr("title", giphyImageData.title);
        imgContainer.append(img);

        // showing the rating in a caption
        let figCaption = $("<figcaption>");
        figCaption.text(giphyImageData.rating.toUpperCase());
        figCaption.addClass("rating");
        imgContainer.append(figCaption);

        // adding a heart for favorites
        let favoriteHeart = $("<span>");
        favoriteHeart.html("&hearts;");
        favoriteHeart.addClass("favorite");
        favoriteHeart.attr("data-url",
            giphyImageData.images[this.animatedStr].url);
        favoriteHeart.attr("title", giphyImageData.title);
        imgContainer.append(favoriteHeart);

        imgContainer.prependTo("#pictures");
    }

    let giphyObject = new GIPHYResponse();


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
            results = JSON.parse(localStorage.getItem(this.customTagKey));
        }
        return results;
    };

    CustomStorage.prototype.isStoredAlready = function (item) {
        let currentStorage = this.retrieve();
        let stringyItem = JSON.stringify(item);  // need this since I store arrays
        if (currentStorage) {
            // can't use index of, i sometimes store arrays
            for (let i = 0; i < currentStorage.length; i++) {
                if (JSON.stringify(currentStorage[i]) == stringyItem) {
                    return true;
                }
            }
        }
        return false;
    }

    CustomStorage.prototype.reset = function () {
        if (this.storageAvailable) {
            localStorage.removeItem(this.customTagKey);
        }
    }



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


    buttonStorage = new CustomStorage("GIFMadness" + "CustomButtons");

    // we need to listen to the submit button and add any requested text as
    // tags to the array
    let customTagElement = $("#customTag");
    $("#submitButton").click(function (event) {
        
        event.preventDefault();
        let userInput = customTagElement.val().trim();
        // make sure the user input isn't whitespace or a repeat
        if (userInput && tags.indexOf(userInput) == -1) {
            tags.addElement(userInput);
            buttonStorage.add(userInput);
        }
        customTagElement.val("");  // reset after submit
    });

    // Initialize the page by creating a button for each tag
    // in the array 
    // Start listening for clicks on the buttons
    tags.init = function () {
        for (let i = 0; i < tags.length; i++) {
            this.createButton(tags[i]);
        }

        // add the existing tags to the array
        let result = buttonStorage.retrieve();
        if (result) {
            for (let i = 0; i < result.length; i++) {
                tags.addElement(result[i]);
            }
        }

        this.listenForClicks();
    };

    // add a new tag to the array and add it to the DOM
    tags.addElement = function (tagText) {
        this.push(tagText);
        this.createButton(tagText);
    };

    // this is needed to keep track of what the last search was
    // in case we need to offset
    tags.lastSearchTerm = "";
    tags.offset = 0;
    tags.requestedGIFS = 10;
    // listen to clicks on the buttons and request
    // from GIPHY the gifs related to the button text
    tags.listenForClicks = function () {

        // must listen to #tags div to account for dynamically
        // created buttons
        $("#tags").on("click", ".btn", function () {

            let searchTerm = encodeURIComponent($(this).text());
            let myKey = "MSfEV1eyHtNS3mXorDXyqTQ7JB6jY8Pi";

            if (searchTerm == tags.lastSearchTerm) {
                tags.offset += tags.requestedGIFS;
            }
            else {
                tags.offset = 0;
                tags.lastSearchTerm = searchTerm;
                giphyObject.clear();
            }

            let queryURL = `https://api.giphy.com/v1/gifs/search?q=${searchTerm}&api_key=${myKey}&limit=${tags.requestedGIFS}&offset=${tags.offset}`;

            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function (response) {
                giphyObject.createImages(response.data);
                // fortunately GIPHY fails nicely if you request more pictures
                // than are available, it returns and empty data array
                // and doesn't cause my code to crash.
            });
        });
    };

    tags.init();





    // this is a class that can be used to toggle on and off those irritating
    // thanks Andrey for the more elegant solution of putting the show class on the parent
    function RatingsToggler() {
        let self = this;

        $("#showRatingsLink").click(function (event) {
            event.preventDefault();
            if ($("#pictures").hasClass("show-ratings")) {
                $("#pictures").removeClass("show-ratings");
                $("#pictures").addClass("no-ratings");
            }
            else {
                $("#pictures").addClass("show-ratings");
                $("#pictures").removeClass("no-ratings");
            }
        });
    }
    let toggler = new RatingsToggler();



    // this is an object to take care of showing, storing favorite gifs
    function FavoritesGIFS() {
        // create a storage object with the tag we have been storing stuff
        this.favoritesStorage = new CustomStorage("GIFMadness" + "Favorites");
        this.favoritesContainer = $("#favorites");

        // retrieve old/stored favorites and add them to the favorites section
        oldFavorites = this.favoritesStorage.retrieve();
        if (oldFavorites) {
            for (let i = 0; i < oldFavorites.length; i++) {
                this.createFavoriteImage(oldFavorites[i][0],
                    oldFavorites[i][1]);
            }
        }

        this.listenForNewFavorites();
        this.listenForFavoriteClicked();
    }

    // create a favorite image thumbnail in the favorite section
    FavoritesGIFS.prototype.createFavoriteImage = function (url, title) {
        let img = $("<img>");
        img.attr("src", url);
        img.attr("alt", title);
        img.attr("title", title);
        this.favoritesContainer.append(img);
    }

    // listen for the clicking of the hearts to add new favorites
    FavoritesGIFS.prototype.listenForNewFavorites = function () {
        let self = this;

        $("#pictures").on("click", ".favorite", function () {
            let newFavorite = $(this).attr("data-url");
            let favTitle = $(this).attr("title");

            if (!self.favoritesStorage.isStoredAlready([newFavorite, favTitle])) {
                self.createFavoriteImage(newFavorite, favTitle);
                self.favoritesStorage.add([newFavorite, favTitle]);
            }
        });
    };

    FavoritesGIFS.prototype.listenForFavoriteClicked = function () {

        this.favoritesContainer.on("click", "img", function () {

            let imgContainer = $("body");
            let img = $("<img>");
            img.attr("src", $(this).attr("src"));
            img.attr("alt", $(this).attr("title"));
            img.attr("title", $(this).attr("title"));
            img.addClass("takeOverScreen");
            imgContainer.append(img);

            img.click(function () {
                img.remove();
            });
        });
    };
    let favoritesObject = new FavoritesGIFS();



});