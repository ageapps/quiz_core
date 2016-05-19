/**
 * Created by adricacho on 3/5/16.
 */
var models = require('../models');
var Sequelize = require('sequelize');



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
            quizzes: quizzes,
            indexTitle: "Look for a quiz"
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
        res.render('quizzes/index', {
            quizzes: quizzes,
            indexTitle: "Quizzes found"
        });
    }).catch(function(error) {
        next(error);
    });

}
exports.new = function(req, res, next) {
    var quiz = models.Quiz.build({
        question: "",
        answer: ""
    });
    res.render('quizzes/new', {
        quiz: quiz
    });
};

exports.create = function(req, res, next) {
    var quiz = models.Quiz.build({
        question: req.body.quiz.question,
        answer: req.body.quiz.answer
    });


    quiz.save({
        fields: ["question", "answer"]
    }).then(function(quiz) {
        req.flash("success", "Quiz succesfully created");
        res.redirect("/quizzes");
    }).catch(Sequelize.ValidationError, function(error) {

        req.flash("error", "Errors in form ");
        for (var i in error.errors) {
            req.flash("error", error.errors[i].value);
        }
        res.render('quizzes/new', {
            quiz: quiz
        });

    }).catch(function(error) {
        req.flash("error", "Errors while creating Quiz: " + error.message);
        next(error);
    });
};
