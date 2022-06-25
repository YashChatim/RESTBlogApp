const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const expressSanitizer = require("express-sanitizer");

require("dotenv").config();

var url = process.env.DATABASEURL || "mongodb://localhost/restful_blog_app" // process.env.DATABASEURL - environmental variable for database

mongoose.connect(url, { 
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true 
});
app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded()); //Parse URL-encoded bodies
app.use(expressSanitizer()); // always needs to be after bodyParser.urlencoded
app.use(express.static(__dirname + "/public")); // __dirname - directory where script was run
app.use(methodOverride("_method")); // method-override listens for _method


// App config
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now} // Date.now sets the current date when created
});


// Mongoose/model config
var Blog = mongoose.model("Blog", blogSchema);

/*
Blog.create({
    title: "Vegeta",
    image: "http://images6.fanpop.com/image/photos/37200000/vegeta-sama-dragon-ball-z-37298623-480-480.jpg",
    body: "This is a Vegeta fanart"
});
*/


// RESTful routes

app.get("/", (req, res) => { // replace function with => arrow function in es6
    res.redirect("/blogs");
});


// INDEX route
app.get("/blogs", (req,res) => {
    // get all campgrounds from database
    Blog.find({}, (err, blogs) => { // {} finds everything
        if(err) {
            console.log(err);
        }
        else {
            res.render("index.ejs", {blogs: blogs}); // {blogs: blogs} the contents of blogs is sent to blogs which is furthur used in index.ejs 
        }
    });
});


// NEW route
app.get("/blogs/new", (req,res) => {
    res.render("new.ejs");
});


// CREATE route
app.post("/blogs", async(req, res) => {
    let blog = new Blog({
        title: req.body.title,
        image: req.body.image,
        body: req.body.body
    });

    try {
        await blog.save();
        res.redirect("/blogs");
    } catch {
        res.render("new.ejs");
    }
});


// SHOW route
app.get("/blogs/:id", (req,res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err) {
            res.redirect("/blogs");
        }
        else {
            // redirect to index page
            res.render("show.ejs", {blog: foundBlog}); // {blog: foundBlog} the contents of foundBlog is sent to blog which is furthur used in show.ejs
        }
    });
});


// EDIT route
app.get("/blogs/:id/edit", (req,res) => {
    Blog.findById(req.params.id, (err,foundBlog) => {
        if(err) {
            res.redirect("/blogs");
        }
        else {
            res.render("edit.ejs", {blog: foundBlog});
        }
    });
});


// UPDATE route
app.put("/blogs/:id", async(req, res) => {
    try {
        let blog = await Blog.findById(req.params.id);
        Object.assign(blog, req.body);
        blog.save();
        res.redirect("/blogs/" + req.params.id); // redirects to the right show page with specified id
    } catch {
        res.redirect("/blogs");
    }
});


// DESTROY route
app.delete("/blogs/:id", (req, res) => {
    // deletes a blog
    Blog.findByIdAndRemove(req.params.id, (err) => {
        if(err) {
            res.redirect("/blogs");
        }
        else {
            res.redirect("/blogs");
        }
    });
});


app.listen(process.env.PORT, process.env.IP, function(){ // process.env.PORT, process.env.IP  - environmental viriables set up for cloud9 which we access
    console.log("Server started");
});