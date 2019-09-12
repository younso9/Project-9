'use strict';

// This loads application modules
const express = require('express');
const morgan = require('morgan');
const {sequelize, models} = require('./models');
const {User} = require('./models');
const {Course} = require('./models');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

// This variable will enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// This creates the Express app that facilitates the rapid development of Node based Web applications
const app = express();

// This sets up morgan HTTP request logger middleware.  
// which simplifies the process of logging requests to your application.
app.use(morgan('dev'));

// Body-parser analyzes the JSON, buffer, string and URL encoded data submitted using HTTP request.
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// // This enables access to req.body
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// This is the async/await handler
const asyncHandler = cb => {
    return async (req, res, next) => {
        try {
            await cb(req, res, next);
        } catch (err) {
            console.log('Error Found in the Application');
            next(err);
        }
    }
}

// This is the User Authentication middleware
const authenticateUser = async (req, res, next) => {
    let message = null;
    //check for user credentials in authorization header
    const credentials = auth(req);
    if (credentials) {
        //locate user with matching email address
        const user = await User.findOne({
            raw: true,
            where: {
                emailAddress: credentials.name,
            },
        });
        if (user) {
            //if password in authorization header matches matched user's password
            const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
            if (authenticated) {
                //authentication was successful
                console.log(`Authentication successful for user: ${user.firstName} ${user.lastName}`);
                if (req.originalUrl.includes('courses')) {
                    req.body.userId = user.id;
                } else if (req.originalUrl.includes('users')) {
                    req.body.id = user.id;
                }
            } else {
                //authentication  not successful
                message = `Authentication failed for user: ${user.firstName} ${user.lastName}`;
            }
        } else {
            //there was no user with an email address matching the email address in the authorization header
            message = `User not found for email address: ${credentials.name}`;
        }
    } else {
        //no user credentials/authorization header available
        message = 'Authorization header not found';
    }
    //if there is a message, then access is denied
    if (message) {
        console.warn(message);
        const err = new Error('Access Denied');
        err.status = 401;
        next(err);
    } else {
        //user is authenticated
        next();
    }
}

// This will returns the Authenticated user
app.get('/api/users', authenticateUser, asyncHandler(async (req, res) => {
    const user = await User.findByPk(
        req.body.id,
        {
            attributes: {
                exclude: ['password', 'createdAt', 'updatedAt'],
            },
        }
    );
    res.json(user);
})
);

// This creates a user and will sets the 'Location' header to '/'
app.post('/api/users', asyncHandler(async (req, res) => {
    // This is checking if the request body has a password
    if (req.body.password) {
        // This hashes/encrypts the password and attempts to create a new user 
        req.body.password = await bcryptjs.hashSync(req.body.password);
        
        // This triggers validation for the User model
        const newUser = await User.create(req.body);
    } else {
        // This triggers validation for Users model
        const newUser = await User.create(req.body);
    }
    // If the instance was success, this will reset response location then send a 201 status code
    res.location('/');
    res.status(201).end();
})
);

// This returns a list of courses with the user
app.get('/api/courses', asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
        
        // This filters out private and information that is not needed
        attributes: {
            exclude: ['createdAt', 'updatedAt'],
        },
        include: [
            {
                model: User,
                as: 'user',
                attributes: {
                    exclude: ['password', 'createdAt', 'updatedAt'],
                },
            },
        ],
    });
    res.json(courses);
})
);

// This returns the course with the course ID
app.get('/api/courses/:id', asyncHandler(async (req, res) => {
    const course = await Course.findAll({
        
        // This filters out private and information that is not needed
        where: {
            id: req.params.id,
        },
        attributes: {
            exclude: ['createdAt', 'updatedAt'],
        },
        include: [
            {
                model: User,
                as: 'user',
                attributes: {
                    exclude: ['password', 'createdAt', 'updatedAt'],
                },
            },
        ],
    });
    res.json(course);
})
);

// This creates a course and sets the 'Location' header to the URI for the course
// This course validations makes sure that requested data is provided by user
app.post('/api/courses', authenticateUser, asyncHandler(async (req, res) => {
    const newCourse = await Course.create(req.body);
    res.location(`/api/courses/${newCourse.id}`);
    res.status(201).end();
})
);

// This will update the course 
app.put('/api/courses/:id', authenticateUser, asyncHandler(async (req, res, next) => {
    let course = await Course.findByPk(req.params.id);
   
    // This checks to ensure that authenticated user is the associated with the course
    if (course.userId === req.body.userId) {
        course.title = req.body.title;
        course.description = req.body.description;
        course.estimatedTime = req.body.estimatedTime;
        course.materialsNeeded = req.body.materialsNeeded;
        
        // This validations will ensure that required data is provided
        course = await course.save();
        res.status(204).end();
    } else {
        // This prohibits users from updating courses that they are not associated with.
        const err = new Error('This Action is Not Allowed');
        err.status = 403;
        next(err);
    }
})
);

// This will delete a course
app.delete('/api/courses/:id', authenticateUser, asyncHandler(async (req, res, next) => {
    const course = await Course.findByPk(req.params.id);
    
    // This checks that authenticated user is associated with the course
    if (course.userId === req.body.userId) {
        await course.destroy();
        res.status(204).end();
    } else {
        
        // This forbids users may not delete courses that they do not own
        const err = new Error('This Action is Not Allowed');
        err.status = 403;
        next(err);
    }
})
);

// This is the ~ 'Home Page' route handler
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the REST API project!',
    });
});

// This is the 404 ~ 'Not Found' route handler
app.use((req, res) => {
    res.status(404).json({
        message: 'This Route Not Found',
    });
});

// // This is the Global Error handler
// app.use((err, req, res, next) => {
//     if (enableGlobalErrorLogging) {
//         console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
//     }
//     if (err.name === 'SequelizeValidationError') {
//         let errorString = '';
//         for (let error in err.errors) {
//             errorString += `${err.errors[error].message}\n`;
//         }
//         err.status = 400;
//     }
//     if (err.name === 'SequelizeUniqueConstraintError') {
//         err.status = 400;
//     }
//     console.log(err);
//     res.status(err.status || 500).json({
//         message: err.message,
//         error: {},
//     });
// });


// This sets port value
app.set('port', process.env.PORT || 5000);

// This will test the connection to the database
console.log('Testing connection to the db');
sequelize
    .authenticate() // Attempt to authenticate database
    .then(() => {
        // If database is authenticated, then sync the database
        console.log('Connection Successful - Syncing in progress');
        return sequelize.sync();
    })
    .then(() => {
        // This will start listening on port if db authentication succeeds and if database has been synced
        const server = app.listen(app.get('port'), () => {
            console.log(`Express server is listening on port ${server.address().port}`);
        });
    }) // This will inform the user if authentication to the db has failed.
    .catch(err => console.log('Sorry ~ Connection Failed'));




// 'use strict';

// // This will load modules
// const express = require('express');
// const morgan = require('morgan');

// const app = require('./routes/routes.js');

// // This variable will enable global error logging
// const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// // This sets up morgan which will give http request logging
// app.use(morgan('dev'));

// // This sets the port
// app.set('port', process.env.PORT || 5000);

// // This will start listening to the port
// const server = app.listen(app.get('port'), () => {
//     console.log(`Express server is listening on port ${server.address().port}`);
// });