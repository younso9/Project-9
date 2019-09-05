'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const Sequelize = require('sequelize');
const courseRoute = require("./routes/courseRoute");
const usersRoute = require("./routes/usersRoute");


// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

app.use('/api', usersRoute);
app.use('/api', courseRoute);


// setup morgan which gives us http request logging
app.use(morgan('dev'));

// TODO setup your api routes here

//USERS
  // 1 setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});


// const usersRoute = require('./routes/users');





// // Redirect to api route


// app.get("/", function (req, res, next) {


//   res.redirect("/api");


// });


// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});

// https://teamtreehouse.com/library/create-an-express-app
