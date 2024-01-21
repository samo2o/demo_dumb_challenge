const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correct: { type: String, required: true }
});

const QuizSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    questions: { type: [QuestionSchema], required: true }
});

module.exports = mongoose.model('Quiz', QuizSchema);