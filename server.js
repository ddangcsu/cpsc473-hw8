/* jshint curly: true, eqeqeq: true, forin: true, immed: true, indent: 4,
latedef: true, newcap: true, nonew: true, quotmark: double, undef: true,
unused: true, strict: true, trailing: true, node: true */

"use strict";

var express = require("express"),
    http = require("http"),
    parser = require("body-parser"),
    // import the mongoose library
    mongoose = require("mongoose"),
    toDoController = require("./controllers/toDoController"),
    app = express();

app.use(express.static(__dirname + "/client"));
// use body-parser for express 4+
app.use(parser.urlencoded({extended: true}));

// connect to the amazeriffic data store in mongo
mongoose.connect("mongodb://localhost/amazeriffic");

app.get("/todos.json", toDoController.getAllToDos);

app.post("/todos", toDoController.addToDo);

// Start server here
http.createServer(app).listen(3000);

console.log("Server started on port 3000");
