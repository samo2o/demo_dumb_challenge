const express = require('express');
const { check } = require('express-validator');

const { login, signup } = require('../controllers/user-controllers');

const router = express.Router();

router.post('/login', [
    check('username')
        .notEmpty(),
    check('password')
        .notEmpty()
], login);

router.post('/signup', [
    check('username')
        .isLength({
            min: 3,
            max: 30
        }),
    check('password')
        .notEmpty(),
    check('email')
        .isEmail()
], signup);

module.exports = router;