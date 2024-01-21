const express = require('express');
const { check } = require('express-validator');

const checkAuth = require('../models/check-auth');
const { getAllQuizzes, getUserQuizzes, getQuizById, createNewQuiz, editQuiz, deleteQuiz } = require('../controllers/quiz-controllers');

const router = express.Router();

router.use(checkAuth);

router.get('/', getAllQuizzes);

router.get('/user', getUserQuizzes);

router.get('/:qid', getQuizById);

router.post('/', [
    check('title')
        .isLength({
            min: 3,
            max: 50
        }),
    check('description')
        .isLength({
            min: 3,
            max: 120
        }),
    check('questions')
        .isArray({
            min: 2,
            max: 5
        })
], createNewQuiz);

router.patch('/:qid', [
    check('title')
        .isLength({
            min: 3,
            max: 50
        }),
    check('description')
        .isLength({
            min: 3,
            max: 120
        }),
    check('questions')
        .isArray({
            min: 2,
            max: 5
        })
],  editQuiz);

router.delete('/:qid', deleteQuiz);

module.exports = router;