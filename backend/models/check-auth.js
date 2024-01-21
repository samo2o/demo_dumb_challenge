const jwt = require('jsonwebtoken');

const HttpError = require("./http-error");
const PRIVATE_KEY = require('../constants');

const checkAuth = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }

    if (!req.headers.authorization) {
        return next(
            new HttpError(
                'No authorization token was found.',
                401
            )
        );
    }

    try {
        const TOKEN = req.headers.authorization.split(' ')[1];
        if (!TOKEN) {
            return next(
                new HttpError(
                    'No authorization token was found.',
                    401
                )
            )
        }

        const decodedToken = jwt.verify(TOKEN, PRIVATE_KEY);
        req.userData = { userId: decodedToken.userId, email: decodedToken.email };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(
                new HttpError(
                    'Token has expired. Please log in again.',
                    401
                )
            );
        }
        return next(
            error || 'Something went wrong while checking for authorization.'
        );
    }
}

module.exports = checkAuth;