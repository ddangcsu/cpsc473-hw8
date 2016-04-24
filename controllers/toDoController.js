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

var Controller = {
    // Controller to search and return toDo JSON Object from Mongoose
    getAllToDos: function (req, res) {
        ToDo.find({}, function (err, toDos) {
            res.json(toDos);
        });
    },

    // Controller to add ToDo
    addToDo: function (req, res) {
        console.log(req.body);
        var newToDo = new ToDo({
            "description":req.body.description,
            "tags":req.body.tags
        });

        newToDo.save(function (err) {
            if (err !== null) {
                // the element did not get saved!
                console.log(err);
                res.send("ERROR");
            } else {
                // our client expects *all* of the todo items to be returned, so we'll do
                // an additional request to maintain compatibility
                ToDo.find({}, function (err, result) {
                    if (err !== null) {
                        // the element did not get saved!
                        res.send("ERROR");
                    }
                    res.json(result);
                });
            }
        });
    },
};


module.exports = Controller;
