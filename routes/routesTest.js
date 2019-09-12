// create the Express app
const express = require("express");
const app = express();

const Sequelize = require("sequelize");

//Body-parser:  informs the application what format http request bodys will contain, in our case everything is JSON
const bodyParser = require("body-parser");
app.use(bodyParser.json());

//bring over the authenticateUser function from the auth.js file
const authenticateUser = require("./auth");

//Sequelize DB object typical way to get Sequelize DB object
app.set("models", require("../models"));

// RESOURCE: https://teamtreehouse.com/library/rest-api-authentication-with-express
//AUTHENTICATION MIDDLEWARE
const authenticateUser = (req, res, next) => {
  let message = null;

  // Analyzes the user's credentials from the Authorization header.
  const credentials = auth(req);

  // If the user's credentials are available...
  if (!credentials) {
    console.warn("Auth header not found");

    // This will return a 401 - Unauthorized HTTP status code response.
    res.status(401).json({ message: "Access Denied" });
  } else {
    const User = app.get("models").User;
    const user = User.findOne({
      where: { emailAddress: credentials.name }
    }).then(user => {
      if (user) {
        // Uses the bcryptjs npm package to compare the user's password
        // (from the Authorization header) to the user's password
        // that was retrieved from the data store.
        const authenticated = bcrypt.compareSync(
          credentials.pass,
          user.password
        );

        // If the passwords match...  Then store the retrieved user object on the request object
        // so any middleware functions that follows will have access to the user's information.
        if (authenticated) {
          console.log(`Email Authentication Successful: ${user.emailAddress}`);
          req.currentUser = user;
        } else {
          message = `Authentication failure for username: ${user.emailAddress}`;
        }
      } else {
        message = `User not found for username: ${credentials.name}`;
      }
      if (message) {
        console.warn(message);

        // Return a response with a 401 Unauthorized HTTP status code.
        res.status(401).json({ message: "Access Denied" });
      } else {
        // Or if user authentication succeeded - next() method is then called..

        next();
      }
    });
  }
};

//USER ROUTES
//AUTHENTICATION
//Send a GET request to /api/users to show users
//Returns HTTP: Status Code 200 means OK
app.get("/api/users", authenticateUser, (req, res, next) => {
  res.status(200);
  res.json(req.currentUser);
});

//USER ROUTES
// This will send a POST request to /api/users to create a user
// It returns HTTP: Status Code 201 - means created successfully
app.post("/api/users", (req, res, next) => {
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
    res.json({ messages: errors });
  } else {
    const User = app.get("models").User;

    User.findOne({
      where: { emailAddress: user.emailAddress }
    }).then(checkUser => {
      if (!checkUser) {
        user.password = bcrypt.hashSync(user.password, 8);
        User.create(user)
          .then(() => {
            res.set("Location", "/");
            res.status(201);
            res.send();
          })
          .catch(err => {
            //https://stackoverflow.com/questions/16507222/create-json-object-dynamically-via-javascript-without-concate-strings
            // IF a validation error of 400 returns - means Bad Request
            if (err.name === "SequelizeValidationError") {
              res.status(400);
              res.json({
                name: err.name,
                message: err.errors[0].message,
                type: err.errors[0].type
              });
            } else {
              throw err;
            }
          })
          .catch(err => {
            next(new Error(err));
          });
      } else {
        res.status(400);
        res.json({ message: "Given emailAddress already in use." });
      }
    });
  }
});
//COURSE ROUTES - Resource: https://stackoverflow.com/questions/21883484/how-to-use-an-include-with-attributes-with-sequelize
// This will send a GET request to /api/courses to list courses
// It will returns a 200 HTTP: Status Code - request successfull

app.get("/api/courses", (req, res, next) => {
  const Course = app.get("models").Course;
  const User = app.get("models").User;
  //get list of courses
  Course.findAll({
    order: [["title", "ASC"]],
    include: [{ model: User, as: "user" }]
  }).then(courseList => {
    res.status(200);
    res.json(courseList);
  });
});

//COURSE ROUTES
// This will send a GET request to /api/courses/:id to show course
// This will returns HTTP: Status Code 200 - successful
app.get("/api/courses/:id", (req, res, next) => {
  const Course = app.get("models").Course;
  const User = app.get("models").User;
  Course.findByPk(req.params.id, {
    attributes: attributesCourse,
    include: [{ model: User, as: "user", attributes: attributesUser }]
  })
    .then(foundCourse => {
      if (foundCourse) {
        res.status(200);
        res.json(foundCourse);
      } else {
        //Render 404 if :id is not found in the db
        res.status(404);
        res.json({ message: "Course not found for ID " + req.params.id });
      }
    })
    .catch(err => {
      next(new Error(err));
    });
});

//COURSE ROUTES
// This will send a GET request to /api/courses/:id to show course
// It will returns HTTP: Status Code 200
app.get("/api/courses/:id", (req, res, next) => {
  const Course = app.get("models").Course;
  const User = app.get("models").User;
  Course.findByPk(req.params.id, {
    include: [{ model: User, as: "user" }]
  })
    .then(foundCourse => {
      if (foundCourse) {
        res.status(200);
        res.json(foundCourse);
      } else {
        // This will render 404 if course :id is not found in the db
        res.status(404);
        res.json({ message: "Course not found for ID " + req.params.id });
      }
    })
    .catch(err => {
      next(new Error(err));
    });
});

//COURSE ROUTES
// This sends a POST request to /api/courses to create courses
// It the returns an HTTP: Status Code 201 (Created Successfully)
//Authentication
app.post("/api/courses", authenticateUser, (req, res, next) => {
  const course = req.body;

  //create the course
  //set HTTP header to the URI for the course
  const Course = app.get("models").Course;

  course.userId = req.currentUser.id;

  Course.create(course)
    .then(course => {
      const fullUrl =
        req.protocol + "://" + req.get("host") + "/api/course/" + course.id;
      res.set("Location", fullUrl);
    })
    .then(() => {
      res.status(201);
      res.send();
    })
    .catch(err => {
      if (err.name === "SequelizeValidationError") {
        res.status(400);
        res.json({
          name: err.name,
          message: err.errors[0].message,
          type: err.errors[0].type
        });
      } else {
        throw err;
      }
    })
    .catch(err => {
      next(new Error(err));
    });
  //}
});

//COURSE ROUTES
// Authentication
// This will send a PUT request to /api/courses/:id to update courses
// It then returns HTTP: Status Code 204 (No Content)

app.put("/api/courses/:id", authenticateUser, (req, res, next) => {
  const course = req.body;

  const errors = [];

  if (!course.title) {
    errors.push('Please provide a value for "title"');
  }
  if (!course.description) {
    errors.push('Please provide a value for "description"');
  }

  if (errors.length != 0) {
    res.status(400);
    res.json(errors);
  } else {
    const Course = app.get("models").Course;

    // This update the course ID :id

    Course.findByPk(req.params.id).then(foundCourse => {
      if (!foundCourse) {
        res.status(400);
        res.json({ message: "Course not found for ID " + req.params.id });
      } else {
        if (foundCourse.userId === req.currentUser.id) {
          Course.update(req.body, {
            where: { id: req.params.id }
          })
            .then(() => {
              res.status(204);
              res.send();
            })
            .catch(err => {
              if (err.name === "SequelizeValidationError") {
                res.status(400);
                res.json({
                  name: err.name,
                  message: err.errors[0].message,
                  type: err.errors[0].type
                });
              } else {
                throw err;
              }
            })
            .catch(err => {
              next(new Error(err));
            });
        } else {
          res.status(403);
          res.json({
            message: "Course does not belong to currently authenticated user."
          });
        }
      }
    });
  }
});

//COURSE ROUTES
// Authentication
// Send a DELETE request to /api/courses/:id to delete courses

app.delete("/api/courses/:id", authenticateUser, (req, res, next) => {
  // This will check if the course ID :id exists and delete courses.
  const Course = app.get("models").Course;

  Course.findByPk(req.params.id)
    .then(foundCourse => {
      if (foundCourse) {
        if (foundCourse.userId === req.currentUser.id) {
          Course.destroy({
            where: { id: req.params.id }
          })
            .then(() => {
              res.status(204);
              res.send();
            })
            .catch(err => {
              next(new Error(err));
            });
        } else {
          res.status(403);
          res.json({
            message: "Course does not belong to currently authenticated user."
          });
        }
      } else {
        res.status(404);
        res.json({ message: "Course not found for ID " + req.params.id });
      }
    })
    .catch(err => {
      next(new Error(err));
    });
});

// This will setup a friendly greeting for the root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the REST API project!"
  });
});

// This tests database connection on startup
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
