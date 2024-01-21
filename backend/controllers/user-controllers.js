const mongoose = require('mongoose');
const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require("../models/http-error");
const User = require("../models/user");
const Quiz = require("../models/quiz");
const PRIVATE_KEY = require("../constants");

/* -------------------------------------------------------------------------- */
const login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError(
                'Invalid inputs. Please check your inputs and try again.',
                422
            )
        );
    }

    const { username, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ username: username });
    } catch (error) {
        return next(
            error || 'Something went wrong while checking for username.'
        );
    }

    if (!existingUser) {
        return next(
            new HttpError(
                'User not found.',
                400
            )
        );
    }

    let passwordIsValid;
    try {
        passwordIsValid = await bcrypt.compare(password, existingUser.password);
    } catch (error) {
        return next(
            error || 'Something went wrong while checking for password.'
        );
    }

    if (!passwordIsValid) {
        return next(
            new HttpError(
                'Wrong password.',
                401
            )
        );
    }

    let TOKEN;
    try {
        TOKEN = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            PRIVATE_KEY,
            { expiresIn: '1h' }
        );
    } catch (error) {
        return next(
            error || 'Something went wrong while creating user token.'
        );
    }

    if (!TOKEN) {
        return next(
            new HttpError(
                'No user token was created. Please try again later.',
                500
            )
        );
    }

    res.json({
        userId: existingUser.id,
        email: existingUser.email,
        token: TOKEN
    });
}

/* -------------------------------------------------------------------------- */
const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError(
                'Invalid inputs. Please check your inputs and try again.',
                422
            )
        );
    }

    const { username, email, password } = req.body;

    let usernameExists;
    let emailExists;
    try {
        usernameExists = await User.findOne({ username: username });
        emailExists = await User.findOne({ email: email });
    } catch (error) {
        return next(
            error || 'Something went wrong while checking for username/email.'
        );
    }

    if (emailExists) {
        return next(
            new HttpError(
                'This email is already exists.',
                422
            )
        );
    }
    if (usernameExists) {
        return next(
            new HttpError(
                'The provided username was taken. Please re-enter a unique username and try again.',
                422
            )
        );
    }

    let hashPassword;
    try {
        hashPassword = await bcrypt.hash(password, 12);
    } catch (error) {
        return next(
            error || 'Something went wrong while saving the user password. Please try again later.'
        );
    }

    if (!hashPassword) {
        return next(
            new HttpError(
                'Something went wrong while saving the user password. Please try again later.',
                500
            )
        );
    }

    let userQuizzes;
    try {
        userQuizzes = await Quiz.find();
    } catch (error) {
        return next(
            error || 'Something went wrong while getting the quizzes data for the user. PLease try again later.'
        );
    }

    const quizzes = userQuizzes.map(quiz => quiz.id);
    const createdUser = new User({
        username: username,
        email: email,
        password: hashPassword,
        quizzes: quizzes
    });

    let sess;
    try {
        sess = await mongoose.startSession();
        sess.startTransaction();
        await createdUser.save({ session: sess });
        await sess.commitTransaction();
    } catch (error) {
        return next(
            error || 'Something went wrong while saving userdata.'
        );
    } finally {
        if (sess) {
            await sess.endSession();
        }
    }

    let TOKEN;
    try {
        TOKEN = jwt.sign(
            { userId: createdUser.id, email: createdUser.email },
            PRIVATE_KEY,
            { expiresIn: '1h' }
        );
    } catch (error) {
        return next(
            error || 'Something went wrong while creating token. Please try again later.'
        );
    }

    if (!TOKEN) {
        return next(
            new HttpError(
                'Something went wrong while creating token. Please try again later.',
                500
            )
        );
    }

    res.json({
        userId: createdUser.id,
        email: createdUser.email,
        token: TOKEN
    });
}

exports.login = login;
exports.signup = signup;