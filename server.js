/* jshint curly: true, eqeqeq: true, forin: true, immed: true, indent: 4,
latedef: true, newcap: true, nonew: true, quotmark: double, undef: true,
unused: true, strict: true, trailing: true, node: true */

"use strict";

var express = require("express"),
    app = express(),
    http = require("http"),
    server = http.createServer(app),
    parser = require("body-parser"),
    // import the mongoose library
    mongoose = require("mongoose"),
    // import controller for ToDo
    toDoController = require("./controllers/toDoController"),
    // import socket IO
    io = require("socket.io")();

// Attached IO to the server so that it can use the same IP/Port
io.attach(server);

app.use(express.static(__dirname + "/client"));
// use body-parser for express 4+
app.use(parser.urlencoded({extended: true}));

// connect to the amazeriffic data store in mongo
mongoose.connect("mongodb://localhost/amazeriffic");

app.get("/todos.json", toDoController.getAllToDos);

app.post("/todos", toDoController.addToDo);

// Start server here
server.listen(3000);

console.log("Server started on port 3000");
