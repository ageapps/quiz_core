/**
 * Created by adricacho on 3/5/16.
 */
var models = require('../models');



exports.load = function(req, res, next, quizId) {
    models.Quiz.findById(quizId).then(function(quiz) {
        if (quiz) {
            req.quiz = quiz;
            next();
        } else {
            throw new Error("No existe quizId" + quizId);
        }
    }).catch(function(error) {
        next(error);
    });
}


exports.index = function(req, res, next) {
    models.Quiz.findAll().then(function(quizzes) {
        res.render('quizzes/index', {
            quizzes: quizzes
        });
    }).catch(function(error) {
        next(error);
    });
}

exports.question = function(req, res, next) {

    var answer = req.query.answer || "";
    res.render("quizzes/question", {
        quiz: req.quiz,
        answer: answer
    });
};


exports.check = function(req, res, next) {
    var answer = req.query.answer || "";
    var result = ((answer === req.quiz.answer) ? "Correct" : "Wrong");
    res.render("quizzes/check", {
        quiz: req.quiz,
        result: result,
        answer: answer
    });
};

exports.search = function(req, res, next) {
    var text = req.query.search || "";
    models.Quiz.findAll({
        where: {
            question: {
                $like: "%" + text + "%"
            }
        }
    }).then(function(quizzes) {
        res.render('quizzes/search', {
            quizzes: quizzes
        });
    }).catch(function(error) {
        next(error);
    });

}
