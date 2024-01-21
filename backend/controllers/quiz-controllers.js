const mongoose = require('mongoose');
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const Quiz = require("../models/quiz");
const User = require("../models/user");

const getAllQuizzes = async (req, res, next) => {
    let allQuizzes;
    try {
        allQuizzes = await Quiz.find();
    } catch (error) {
        return next(
            error || 'Something went wrong while getting the quizzes data.'
        );
    }

    res.json({
        quizzes: allQuizzes.map(quiz => quiz.toObject({ getters: true }))
    });
}

const getUserQuizzes = async (req, res, next) => {
    const userId = req.userData.userId;
    if (!userId) {
        return next(
            new HttpError(
                'Please login and try again.',
                500
            )
        );
    }

    let user;
    try {
        user = await User.findById(userId).populate('quizzes');
    } catch (error) {
        return next(
            error || 'Something went wrong while getting the quizzes data.'
        );
    }

    res.json({
        quizzes: user.quizzes
    });
}

const getQuizById = async (req, res, next) => {
    const quizId = req.params.qid;
    if (!quizId) {
        return next(
            new HttpError(
                'Please enter a quiz id and try again.',
                422
            )
        );
    }

    let quiz;
    try {
        quiz = await Quiz.findById(quizId);
    } catch (error) {
        return next(
            error || 'Something went wrong while getting the quiz data.'
        );
    }

    if (!quiz) {
        return next(
            new HttpError(
                'No quiz data was found. Please enter a valid quiz id and try again.',
                422
            )
        );
    }

    res.json({
        quiz: quiz.toObject({ getters: true })
    });
}

const createNewQuiz = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError(
                'Invalid inputs. Please check your inputs and try again.',
                422
            )
        );
    }

    const { title, description, questions } = req.body;

    const createdQuiz = new Quiz({
        title,
        description,
        questions
    });

    let sess;
    try {
        sess = await mongoose.startSession();
        sess.startTransaction()
        await createdQuiz.save({ session: sess });
        const allUsers = await User.find();
        for (const user of allUsers) {
            user.quizzes.push(createdQuiz.id);
            await user.save({ session: sess });
        }
        await sess.commitTransaction();
    } catch (error) {
        return next(
            error || 'Something went wrong while creating the quiz data.'
        );
    } finally {
        if (sess) {
            sess.endSession();
        }
    }

    res.json({
        quiz: createdQuiz.toObject({ getters: true })
    });
}

const editQuiz = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError(
                'Invalid inputs. Please check your inputs and try again.',
                422
            )
        );
    }

    const { title, description, questions } = req.body;

    const quizId = req.params.qid;
    if (!quizId) {
        return next(
            new HttpError(
                'Please enter a quiz id and try again.',
                422
            )
        );
    }

    let sess;
    let editedQuiz;
    try {
        sess = await mongoose.startSession();
        sess.startTransaction();
        editedQuiz = await Quiz.findByIdAndUpdate(quizId, {
            title,
            description,
            questions
        }, {
            session: sess
        });
        await sess.commitTransaction();
    } catch (error) {
        return next(
            error || 'Something went wrong while editting the quiz data.'
        );
    } finally {
        if (sess) {
            sess.endSession();
        }
    }

    res.json({
        quiz: editedQuiz.toObject({ getters: true })
    });
}

const deleteQuiz = async (req, res, next) => {
    const quizId = req.params.qid;
    if (!quizId) {
        return next(
            new HttpError(
                'Please enter a quiz id and try again.',
                422
            )
        );
    }

    let sess;
    try {
        sess = await mongoose.startSession();
        sess.startTransaction();
        await Quiz.findByIdAndRemove(quizId, { session: sess });
        await sess.commitTransaction();
    } catch (error) {
        return next(
            error || 'Something went wrong while deleting quiz data.'
        );
    } finally {
        if (sess) {
            sess.endSession();
        }
    }

    res.json({
        messege: 'Quiz Deleted successfully.'
    })
}

exports.getAllQuizzes = getAllQuizzes;
exports.getUserQuizzes = getUserQuizzes;
exports.getQuizById = getQuizById;
exports.createNewQuiz = createNewQuiz;
exports.editQuiz = editQuiz;
exports.deleteQuiz = deleteQuiz;