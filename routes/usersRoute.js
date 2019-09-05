// Construct a router 
const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
router.use(bodyParser.json());

router.set('models', require('../models'));

//const userData = data.users;   
//const users = require("../models").Users;
//const data = require("../seed/data.json");

// GET/api/users
router.get('/api/usersRoute', (req, res, next) => {
    res.status(200)
    res.json('{}');
});



//POST/api/users 
/* 

router.post('/routes/usersRoute');



 */
module.exports = router;