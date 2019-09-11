
//This will allow authentication header in http request to be received
const auth = require('basic-auth');

// This will load "bcryptjs" package to encrypt and decrypt password values
const bcrypt = require('bcryptjs');

// MIDDLEWARE AUTHENTICATION 
// https://teamtreehouse.com/library/rest-api-authentication-with-express

const authenticateUser = (req, res, next) => {
    let message = null;

    // This analyzes the user's credentials from the authorization header.
    const credentials = auth(req);

    // If the user's credentials are available...
    if (!credentials) {
        console.warn('Authorization Header Not Found');

        // This will return a 401 Unauthorized HTTP status code.
        res.status(401).json({ message: 'Access Denied' });
    }
    else {
        // This will retrieve the user from the data store
        // by their username (i.e. the user's "key"
        // from the Authorization header).
        const User = app.get('models').User;

        // const user = User.find(u => u.emailAddress === credentials.emailAddress);
        User.findOne({
            raw: true,
            where: { emailAddress: credentials.name },
            // DO NOT reduce the query: we need the User.password later
            // delete it when necessary, such as /api/users
            // attributes: attributesUser,
        })
            .then((user) => {

                if (user) {
                    // This uses the bcryptjs npm package to compare the user's password
                    // (from the Authorization header) to the user's password
                    // obtained from the data store.
                    const authenticated = bcrypt.compareSync(credentials.pass, user.password);

                    // If the users passwords is match...
                    if (authenticated) {
                        console.log(`Authentication successful for emailAddress: ${user.emailAddress}`);

                        // Then store the retrieved user object on the request object
                        // so any middleware functions that follow this middleware function
                        // will have access to the user's information.
                        req.currentUser = user;
                    } else {
                        message = `Authentication failure for useremail: ${user.emailAddress}`;
                    }
                }
                else {
                    message = `User not found for username: ${credentials.name}`;
                }
                if (message) {
                    console.warn(message);

                    // This will return a response with a 401 Unauthorized HTTP status code.
                    res.status(401).json({ message: 'Access Denied' });
                } else {
                    // If user authentication succeeded...
                    // Will call the next() method.
                    next();
                }
            });
    }
}

module.exports = authenticateUser;