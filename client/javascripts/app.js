// Client-side code
/* jshint browser: true, jquery: true, curly: true, eqeqeq: true, forin: true,
immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double,
undef: true, unused: true, strict: true, trailing: true */
/* global console: true, io: true, _: true*/

var main = function (toDoObjects) {
    "use strict";
    console.log("SANITY CHECK");

    // Turn the normal map into a function to return the array of description
    var getToDos = function (jsonObject) {
        var toDos = jsonObject.map(function (toDo) {
              // we'll just return the description
              // of this toDoObject
              return toDo.description;
        });
        return toDos;
    };

    // Turn the organizedByTags into a function return
    var organizedByTags = function (jsonObject) {
        var tags = [];

        jsonObject.forEach(function (toDo) {
            toDo.tags.forEach(function (tag) {
                if (tags.indexOf(tag) === -1) {
                    tags.push(tag);
                }
            });
        });
        console.log(tags);

        var tagObjects = tags.map(function (tag) {
            var toDosWithTag = [];

            jsonObject.forEach(function (toDo) {
                if (toDo.tags.indexOf(tag) !== -1) {
                    toDosWithTag.push(toDo.description);
                }
            });

            return { "name": tag, "toDos": toDosWithTag };
        });

        return tagObjects;
    };

    // Learn to factor the client from chapter 9
    // Create a namespace for this app
    var app = {};

    // Define the newestTab information
    app.newestTab = {
        name: "Newest",
        content: function (callback) {
            var $content = $("<ul>");
            var toDos = getToDos(toDoObjects);
            toDos.forEach(function (todo) {
                $content.prepend($("<li>").text(todo));
            });
            // Call back to handle with the content
            callback($content);
        },
    };

    // Define the oldestTab information
    app.oldestTab = {
        name: "Oldest",
        content: function (callback) {
            var $content = $("<ul>");
            var toDos = getToDos(toDoObjects);
            toDos.forEach(function (todo) {
                $content.append($("<li>").text(todo));
            });

            callback($content);
        },
    };

    // Define the tagsTab information
    app.tagsTab = {
        name: "Tags",
        content: function (callback) {

            var tagObjects = organizedByTags(toDoObjects);
            var $container = $("<div>");

            console.log(tagObjects);

            tagObjects.forEach(function (tag) {
                var $tagName = $("<h3>").text(tag.name),
                    $content = $("<ul>");

                tag.toDos.forEach(function (description) {
                    var $li = $("<li>").text(description);
                    $content.append($li);
                });

                // Append to the temporary container
                $container.append($tagName);
                $container.append($content);
            });

            // Return the HTML content of our temp container
            // callback($tempContainer.html());
            // We return the the content including the temp container
            callback($container);
        },
    };

    // Define the addToDo Tab information
    app.addTab = {
        name: "Add",
        content: function (callback) {
            var $content = $("<div>"),
                $input = $("<input>").addClass("description"),
                $inputLabel = $("<p>").text("Description: "),
                $tagInput = $("<input>").addClass("tags"),
                $tagLabel = $("<p>").text("Tags: "),
                $button = $("<span>").text("+");

            // Add .off() to prevent when page reload that trigger multiple
            // click event
            $button.off().on("click", function () {
                var description = $input.val(),
                    // Use regexp to remove blank space
                    tagsNoSpace = $tagInput.val().trim().replace(/\,\s*/g, ","),
                    tags = tagsNoSpace.split(","),
                    newToDo = {"description":description, "tags":tags};

                // Request to add data to server.  Use promise like in jQuery
                var request = $.post("todos", newToDo);

                request.done(function (result) {
                    // Request is done
                    console.log(result);
                    // Clear the input
                    $input.val("");
                    $tagInput.val("");
                    // Redirect to first tab
                    $(".tabs a:first-child span").trigger("click");
                });

                request.fail(function (result) {
                    console.log("Something went wrong when adding Todo " + result);
                });

            });

            $content.append($inputLabel)
                    .append($input)
                    .append($tagLabel)
                    .append($tagInput)
                    .append($button);

            callback($content);
        },
    };

    // Loop through to build the tabs.  Use lodash _.forOwn to loop through
    _.forOwn(app, function (tab, key) {
        console.log ("Building " + key);

        var $tabs = $("main .tabs"),
            $content = $("main .content"),
            $aTag = $("<a>").attr("href", ""),
            $spanTag = $("<span>").text(tab.name).attr("name", key);

        // Setup event when each spanTag is clicked
        $spanTag.off().on("click", function (event) {
            event.preventDefault();

            $(".tabs a span").removeClass("active");
            $spanTag.addClass("active");
            $content.empty();

            // Update the tab content
            tab.content( function (result) {
                $content.append(result);
            });

            //return false;
        });

        // Add them to the tabs
        $tabs.append($aTag.append($spanTag));

    });

    var realTimeToDo = function () {
        // We connect to the server
        var client = io();

        // Setup events handling only after client connected
        client.on("connect", function () {
            console.log("Client connected to server");

            // Handle when client disconnect
            client.on("disconnect", function() {
                console.log("Client disconnected from server");
                // We close the client connection
                client.close();
            });

            // Handle new todo event
            client.on("new todo", function (payload) {
                console.log("A New Todo added: " + payload);
                var toDo = {
                    description: payload.description,
                    tags: payload.tags
                };

                // Determine the current tab
                var $currentTab = $(".tabs span.active"),
                    $content = $("main .content"),
                    tabKey = $currentTab.attr("name");

                // We add it to the todoObjects
                toDoObjects.push(toDo);

                // Update the tab content as long as it's not the add Tab
                if (tabKey !== "addTab") {
                    app[tabKey].content(function (content) {
                        content.hide();
                        $content.empty();
                        $content.append(content);
                        content.slideDown(400);
                    });
                }

            });
        });

    };

    // Run realtime ToDo function to setup socket IO connection and events
    realTimeToDo();

    // Trigger it to go to the first tab on initialize
    $(".tabs a:first-child span").trigger("click");
};

$(document).ready(function () {
    "use strict";
    $.getJSON("todos.json", function (toDoObjects) {
        main(toDoObjects);
    });
});
