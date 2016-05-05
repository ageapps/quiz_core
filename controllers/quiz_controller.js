/**
 * Created by adricacho on 3/5/16.
 */
var models = require('../models');

exports.question = function(req, res, next) {

    models.Quiz.findById(req.params.quizId).then(function(quiz) {
        if (quiz) {
            var answer = req.query.answer || "";
            res.render("quizzes/question", {
                quiz: quiz,
                answer: answer
            });
        } else {
            throw new Error("No hay Preguntas en la DB");
        }
    }).catch(function(error) {
        next(error);
    });
};


exports.index = function(req, res, next) {
    models.Quiz.findAll().then(function(quizzes) {
        res.render('quizzes/index', {
            quizzes: quizzes
        });
    }).catch(function(error) {
        next(error);
    });
}

exports.check = function(req, res, next) {
    models.Quiz.findById(req.params.quizId).then(function(quiz) {
        if (quiz) {
            var answer = req.query.answer || "";
            var result = ((answer === quiz.answer) ? "Correcta" : "Erronea");
            res.render("quizzes/check", {
                quiz: quiz,
                result: result,
                answer: answer
            });
        } else {
            throw new Error("No hay Preguntas en la DB");
        }
    }).catch(function(error) {
        next(error);
    });
};

exports.search = function(req, res, next) {
    var text = req.query.search || "";
    models.Quiz.findAll({
        where: {
            question: {
                $like: "%"+text+"%"
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
