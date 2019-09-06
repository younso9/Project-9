// Constructing a router instance.
const express = require('express');
const router = express.Router();
// const data = require('../seed/data.json')
const User = require('../models').User;
const bodyParser = require('body-parser');
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))



router.get('/user', async (req, res, ) => {
    const users = await User.findAll()
    res.json(users)

});

// router.post('/user', async (req, res) => {

//   let { firstName, lastName, emailAddress, password } = req.body;
//   User.create({})
