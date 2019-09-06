'use strict';

// This loads modules
const express = require('express');
const morgan = require('morgan');
const { sequelize } = require('./models');
const users = require('./routes/users');
const courses = require('./routes/courses');

// This is the Database connection  > Sequelize: validates/assiociates/syncronizes the database
sequelize.authenticate()
  .then(() => {
    console.log('connection successful')
  }).catch((e) => {
    console.log('connection failed. error: ' + e)
  })

// This nable global error logging >  allows access to database when path is set
// 
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

//--request body parser
app.use(express.json());

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// api routes
app.use('/api/users', users)
app.use('/api/courses', courses)

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

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