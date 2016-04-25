/* jshint curly: true, eqeqeq: true, forin: true, immed: true, indent: 4,
latedef: true, newcap: true, nonew: true, quotmark: double, undef: true,
unused: true, strict: true, trailing: true, node: true */

/*  David Dang
    Learn to break the application into modules
    ToDo model for mongoose
*/
"use strict";
// Require models
var ToDo = require("../models/todos.js");
var io = require("socket.io")();

var attachSocketIO = function (server) {
    console.log("Attach http server to socketIO to shared the same port");
    io.attach(server);

    // Create some logging for socket io
    console.log("Setup handler for IO to listen on connection");
    io.on("connection", function (socket) {
        console.log(" Client connected " + socket.id);

        socket.on("disconnect", function (socket) {
            console.log (" Client " + socket.id + " disconnected");
        });
    });
};

var Controller = {
    // Controller to search and return toDo JSON Object from Mongoose
    getAllToDos: function (req, res) {
        ToDo.find({}, function (err, toDos) {
            res.json(toDos);
        });
    },

    // Controller to add ToDo
    addToDo: function (req, res) {
        console.log("Information from post body: " + req.body);
        var newToDo = new ToDo({
            "description":req.body.description,
            "tags":req.body.tags
        });

        newToDo.save(function (err, result) {
            if (err !== null) {
                // the element did not get saved!
                console.log(err);
                res.send("ERROR");
            } else {
                res.send("SUCCESS");
                // Use SocketIO to notify client of newly added todo
                console.log("Todo save result is: " + result);
                io.emit("new todo", result);
                console.log("new todo message broadcast");
            }
        });
    },
};

module.exports.init = attachSocketIO;
module.exports.ToDo = Controller;
