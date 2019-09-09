
//allows receipt of authentication header in http request
const auth = require('basic-auth');

//load bcryptjs package to encrypt and decrypt password values
const bcrypt = require('bcryptjs');

//AUTHENTICATION MIDDLEWARE
//modified from example in
//https://teamtreehouse.com/library/rest-api-authentication-with-express
const authenticateUser = (req, res, next) => {
    let message = null;

    // Parse the user's credentials from the Authorization header.
    const credentials = auth(req);

    // If the user's credentials are available...
    if (!credentials) {
        console.warn('Auth header not found');

        // Return a response with a 401 Unauthorized HTTP status code.
        res.status(401).json({ message: 'Access Denied' });
    }
    else {
        // Attempt to retrieve the user from the data store
        // by their username (i.e. the user's "key"
        // from the Authorization header).
        const User = app.get('models').User;

        //const user = User.find(u => u.emailAddress === credentials.emailAddress);
        User.findOne({
            where: { emailAddress: credentials.name },
            //DO NOT reduce the query: we need the User.password later
            //delete it when necessary, such as /api/users
            //attributes: attributesUser,
        })
            .then((user) => {

                if (user) {
                    // Use the bcryptjs npm package to compare the user's password
                    // (from the Authorization header) to the user's password
                    // that was retrieved from the data store.
                    const authenticated = bcrypt.compareSync(credentials.pass, user.password);

                    // If the passwords match...
                    if (authenticated) {
                        console.log(`Authentication successful for emailAddress: ${user.emailAddress}`);

                        // Then store the retrieved user object on the request object
                        // so any middleware functions that follow this middleware function
                        // will have access to the user's information.
                        req.currentUser = user;
                    } else {
                        message = `Authentication failure for username: ${user.emailAddress}`;
                    }
                }
                else {
                    message = `User not found for username: ${credentials.name}`;
                }
                if (message) {
                    console.warn(message);

                    // Return a response with a 401 Unauthorized HTTP status code.
                    res.status(401).json({ message: 'Access Denied' });
                } else {
                    // Or if user authentication succeeded...
                    // Call the next() method.
                    next();
                }
            });
    }
}

module.exports = authenticateUser;