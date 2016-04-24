var express = require("express"),
    http = require("http"),
    parser = require("body-parser"),
    // import the mongoose library
    mongoose = require("mongoose"),
    app = express();

app.use(express.static(__dirname + "/client"));
// use body-parser for express 4+
app.use(parser.urlencoded({extended: true}));

// connect to the amazeriffic data store in mongo
mongoose.connect('mongodb://localhost/amazeriffic');

// This is our mongoose model for todos
var ToDoSchema = mongoose.Schema({
    description: String,
    tags: [ String ]
});

var ToDo = mongoose.model("ToDo", ToDoSchema);


app.get("/todos.json", function (req, res) {
    ToDo.find({}, function (err, toDos) {
        res.json(toDos);
    });
});

app.post("/todos", function (req, res) {
    console.log(req.body);
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
});


// Start server here
http.createServer(app).listen(3000);

console.log("Server started on port 3000");

