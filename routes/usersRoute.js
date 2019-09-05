// Construct a router 
const express = require('express');
const router = express.Router();
const users = require("../models").Users;
const data = require("../seed/data.json");
const userData = data.users;   


// GET/api/users
router.get('/users', (req, res) => {
    res.json(userData);
});



//POST/api/users 


router.post('/users');


module.exports = router;
