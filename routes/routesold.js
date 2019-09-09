//Body-parser:  informs the application what format http request bodys will contain, in our case everything is JSON
const bodyParser = require('body-parser');
app.use(bodyParser.json());

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



// //Set Public folder via route /static
// app.use('/static', express.static(path.join(__dirname, '../public')))
// app.get('/favicon.ico', (req, res) => res.redirect('/static/favicon.ico'));

// //Sequelize DB object typical way to get Sequelize DB object
// app.set('models', require('../models'));

// // controls whether it writes any error message to the console
// const enableGlobalErrorLogging = false;

// app.get('/', (req, res, next) => {
//     res.redirect('/courses');
// });

// app.get('/courses', (req, res, next) => {
//     try {
//         const Course = app.get('models').Course;

//         Course.findAll()
//             .then((courseList) => {
//                 res.render("index", {
//                     courseList:courseList
//                 });
//             })
//             .catch((err) => {
//                 res.render("error", {
//                     error: err
//                 });
//             });
//     }
//     catch (e) {
//         next(new Error('Your request could not be fulfilled'));
//     }
// });

// app.get('/courses/new', (req, res, next) => {
//     res.render("new-course");
// });

// // ROUTE: Defining post /courses/new route and within it we are creating a course (http://localhost:3000/courses/new)
// app.post('/courses/new', (req, res, next) => {
//     try {
//         const Course = app.get('models').Course;
//         Course.create({
//             title: req.body.title,
//             author: req.body.author,
//             genre: req.body.genre,
//             year: req.body.year
//         })
//             .then(() => {
//                 res.redirect('/courses');
//             })
//             //handle sequelize validation error for the create new course page
//             .catch((err) => {
//                 if (err.name === "SequelizeValidationError") {
//                     res.render("new-course", {
//                         course: Course.build(req.body),
//                         errors: err.errors
//                     });
//                 }
//                 else {
//                     throw err;
//                 }
//             })
//             .catch((err) => {
//                 res.render("error", {
//                     error: err
//                 });
//             });
//     }
//     catch (e) {
//         next(new Error('Request could not be fulfilled'));
//     }
// });

// //ROUTE: Define edit route: /courses/:id (the page displayed will have "Update Course")
// app.get('/courses/:id', (req, res, next) => {
//     try {

//         const Course = app.get('models').Course;
//         Course.findByPk(req.params.id)
//             .then((foundCourse) => {
//                 if (foundCourse) {
//                     res.render("update-course", { id: foundCourse.id, course: foundCourse });
//                 }
//                 else {
//                     res.render("page-not-found");
//                 }
//             })

//             .catch((err) => {
//                 res.render("error", {
//                     error: err
//                 });
//             });
//     }
//     // Renders error view in an event of an error
//     catch (e) {
//         next(new Error('Request could not be fulfilled'));
//     }
// });

// app.post('/courses/:id', (req, res, next) => {
//     try {
//         const Course = app.get('models').Course;

//         Course.update({
//             id: req.body.id,
//             title: req.body.title,
//             description: req.body.description,
//             estimatedTime: req.body.estimatedTime,
//             materialsNeeded: req.body.materialsNeeded
//         },
//             {
//                 where: { id: req.params.id }
//             }
//         )
//             .then(() => {
//                 res.redirect('/courses');
//             })
//             //handle sequelize validation error for the edit page
//             .catch((err) => {
//                 if (err.name === "SequelizeValidationError") {
//                     res.render("update-course", {
//                         course: Course.build(req.body),
//                         id: req.params.id,
//                         errors: err.errors
//                     });
//                 }
//                 else {
//                     throw err;
//                 }
//             })
//             .catch((err) => {
//                 res.render("error", {
//                     error: err
//                 });
//             });
//     }
//     catch (e) {
//         next(new Error('Request could not be fulfilled'));
//     }
// });

// //ROUTE: Define route for 'delete' course for ID = :id
// app.post('/courses/:id/delete', (req, res, next) => {
//     try {
//         const Course = app.get('models').Course;
//         Course.findByPk(req.params.id)
//             .then((foundCourse) => {
//                 if (foundCourse) {
//                     Course.destroy({
//                         where: { id: req.params.id }
//                     }).then(() => {
//                         res.redirect('/courses');
//                     });
//                 }
//                 else {
//                     //Render 404 if the course with this :id is not found
//                     res.render("page-not-found");

//                 }
//             })
//             .catch((err) => {
//                 res.render("error", {
//                     error: err
//                 });
//             });
//     }
//     catch (e) {
//         next(new Error('Request could not be fulfilled'));
//     }
// });



// //default route - respond to anything besides those above
// app.use((req, res, next) => {
//     console.log("Requested route is undefined.");
//     //Page not found
//     res.render("page-not-found");
// });

// const newLocal = 500;
// //error route: reached from any of the non-default in the
// //event of an error (error handler)
// app.use((err, req, res, next) => {
//     console.log(err);
//     if (!res.headersSent) {
//         res.status(newLocal);
//         res.render('error', { error: err });
//     }
// });

// module.exports = app;
