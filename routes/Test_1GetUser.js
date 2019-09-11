// create the Express app
const express = require("express");
const app = express();

const Sequelize = require("sequelize");

//Body-parser:  informs the application what format http request bodys will contain, in our case everything is JSON
const bodyParser = require("body-parser");
app.use(bodyParser.json());

//Sequelize DB object typical way to get Sequelize DB object
app.set("models", require("../models"));

//USER ROUTES
//Send a GET request to /api/users to show users
//Returns HTTP: Status Code 200 means OK
//Authentication
app.get("/api/users", authenticateUser, (req, res, next) => {
  res.status(200);
  res.json(req.currentUser);
});

// setup a friendly greeting for the root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the REST API project!"
  });
});

//Test database connection on startup
const sql = new Sequelize({
  dialect: "sqlite",
  storage: "fsjstd-restapi.db"
});

const test = sql
  .authenticate()
  .then(function() {
    console.log("CONNECTED!");
  })
  .catch(function(err) {
    console.log("FAILED");
  })
  .done();

module.exports = app;



// /* api routes */
// app.use('/api', homeRoute);
// app.use('/api', usersRoute);
// app.use('/api', coursesRoute);