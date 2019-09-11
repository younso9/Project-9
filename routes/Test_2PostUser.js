// create the Express app
const express = require('express');
const app = express();

const Sequelize = require('sequelize');

//Body-parser:  informs the application what format http request bodys will contain, in our case everything is JSON
const bodyParser = require('body-parser');
app.use(bodyParser.json());

//bring over the authenticateUser function from the auth.js file
const authenticateUser = require('./auth');

//Sequelize DB object typical way to get Sequelize DB object
app.set('models', require('../models'));

//USER ROUTES
//Send a GET request to /api/users to show users
//Returns HTTP: Status Code 200 means OK
//Authentication
app.get('/api/users', authenticateUser, (req, res, next) => {
    res.status(200);
    res.json(req.currentUser);
});

//USER ROUTES
//Send a POST request to /api/users to create a user
//Returns HTTP: Status Code 201 means Created
//in the event of a validation error returns a 400 error means Bad Request
app.post('/api/users', (req, res, next) => {
    const user = req.body;

    //Use input validators for emailAddress and password, then use Sequelize validation for the entire model User

    const errors = [];

    if (!user.emailAddress) {
        errors.push('Please provide a value for "emailAddress"');
    }
    if (!user.password) {
        errors.push('Please provide a value for "password"');
    }

    if (errors.length != 0) {
        res.status(400);
        res.json({ "messages": errors });
    }
    else {
        const User = app.get('models').User;

        User.findOne({
            where: { emailAddress: user.emailAddress }
        })
            .then((checkUser) => {
                if (!checkUser) {
                    user.password = bcrypt.hashSync(user.password, 8);
                    User.create(user)
                        .then(() => {
                            res.set('Location', "/");
                            res.status(201);
                            res.send();
                        })
                        .catch((err) => {
                            //https://stackoverflow.com/questions/16507222/create-json-object-dynamically-via-javascript-without-concate-strings
                            if (err.name === "SequelizeValidationError") {
                                res.status(400);
                                res.json({ "name": err.name, "message": err.errors[0].message, "type": err.errors[0].type });
                            }
                            else {
                                throw err;
                            }
                        })
                        .catch((err) => {
                            next(new Error(err));
                        });
                }
                else {
                    res.status(400);
                    res.json({ "message": "Given emailAddress already in use." });
                }
            });
    }
});

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the REST API project!',
    });
});

//Test database connection on startup
const sql = new Sequelize({
    dialect: 'sqlite',
    storage: 'fsjstd-restapi.db'
});

const test = sql.authenticate()
    .then(function () {
        console.log("CONNECTED! ");
    })
    .catch(function (err) {
        console.log("FAILED");
    })
    .done();


module.exports = app;