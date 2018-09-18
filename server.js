// Dependencies
var express = require("express");
var request = require("request");
var cheerio = require("cheerio");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
// Initialize Express
var app = express();

//require Models

var db = require("./models");

// Set Handlebars as the default templating engine.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Routes

app.get("/scrape", function(req, res) {
    // Make a request for the news section of `ycombinator`
    request("wirecutter.com/", function(error, response, html) {
      // Load the html body from request into cheerio
      var $ = cheerio.load(html);
      // For each element with a "headline" class
      $(".hero-row").each(function(i, element) {
        // Save the text and href of each link enclosed in the current element
        var title = $(element).children(".headline").children("a").text();
        var link = $(element).children(".headline").children("a").attr("href");
        var summary = $(element).children(".group").children(".summary").attr("p");
        // If this found element had both a title and a link
        if (title && link && summary) {
          // Insert the data in the scrapedData db
          db.scrapedData.insert({
            title: title,
            link: link,
            summary: summary
          },
          function(err, inserted) {
            if (err) {
              // Log the error if one is encountered during the query
              console.log(err);
            }
            else {
              // Otherwise, log the inserted data
              console.log(inserted);
            }
          });
        }
      });
    });
  
   
  });

  app.listen(3000, function() {
    console.log("App running on port 3000!");
  });
  
  