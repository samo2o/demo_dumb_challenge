const express = require('express');
const mongoose = require('mongoose');

const HttpError = require('./models/http-error');
const userRouter = require('./routes/user-routes');
const quizRouter = require('./routes/quiz-routes');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader(
        'Access-Control-Allow-Origin',
        '*'
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE'
    );
    next();
});

app.use('/api/user', userRouter);
app.use('/api/quiz', quizRouter);

app.use((req, res, next) => {
    return next(
        new HttpError(
            'This route is not supported.',
            404
        )
    );
});

app.use((error, req, res, next) => {
    if (req.headerSent) {
        return next(error);
    }
    res.status(
        error.code || 500
    ).json({
        status: error.code || 500,
        messege: error.message || 'Something went wrong.'
    });
});

const USERNAME = 'express_server_samo';
const PASSWORD = '210120241829';
const DB_NAME = 'dumb_challenge';
const DB_IP = '192.168.178.66';
const DB_PORT = '27017';
const EX_PORT = 5000;

mongoose.connect(
    `mongodb://${USERNAME}:${PASSWORD}@${DB_IP}:${DB_PORT}/${DB_NAME}`,
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(EX_PORT);
        console.log('Server initiated successfully.');
        console.log('- Listening for requests in port: ' + EX_PORT);
    })
    .catch(() => {
        console.log('Server failed to initiate.');
    });