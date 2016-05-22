/**
 * Created by adricacho on 3/5/16.
 */
var models = require('../models');
var Sequelize = require('sequelize');



exports.load = function(req, res, next, quizId) {
    // find quizz
    models.Quiz.findById(quizId, {
        include: [models.Comment]
    }).then(function(quiz) {
        if (quiz) {
            req.quiz = quiz;
            next();
        } else {
            throw new Error(quizId + "Does not exist");
        }
    }).catch(function(error) {
        next(error);
    });
}


exports.index = function(req, res, next) {
    models.Quiz.findAll().then(function(quizzes) {
        if (req.params.format == "json") {
            res.json(quizzes);
        } else {
            res.render('quizzes/index', {
                quizzes: quizzes,
                indexTitle: "Look for a quiz"
            });
        }
    }).catch(function(error) {
        next(error);
    });
};

exports.question = function(req, res, next) {
    if (req.params.format == "json") {
        res.json(req.quiz);
    } else {
        var answer = req.query.answer || "";

        res.render("quizzes/question", {
            quiz: req.quiz,
            answer: answer,
            comment: "",
            QuizId: req.quiz.id
        });
    }
};


exports.check = function(req, res, next) {
    var answer = req.query.answer || "";
    var result = ((answer === req.quiz.answer) ? "Correct" : "Wrong");
    res.render("quizzes/check", {
        quiz: req.quiz,
        result: result,
        answer: answer,
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

};
exports.new = function(req, res, next) {
    var quiz = models.Quiz.build({
        question: "",
        answer: ""
    });
    models.Category.findAll().then(function(categories) {
        res.render('quizzes/new', {
            quiz: quiz,
            categories: categories
        });
    }).catch(function(error) {
        next(error);
    });
};

exports.create = function(req, res, next) {
    var quiz = models.Quiz.build({
        question: req.body.quiz.question,
        answer: req.body.quiz.answer,
        category: req.body.quiz.category
    });

    quiz.save({
        fields: ["question", "answer", "category"]
    }).then(function(quiz) {
        req.flash("success", "Quiz succesfully created");
        res.redirect("/quizzes");
    }).catch(Sequelize.ValidationError, function(error) {

        req.flash("error", "Errors in form ");
        for (var i in error.errors) {
            req.flash("error", error.errors[i].value);
        }
        models.Category.findAll().then(function(categories) {
            res.render('quizzes/new', {
                quiz: quiz,
                categories: categories
            }).catch(function(error) {
                next(error);
            });
        });

    }).catch(function(error) {
        req.flash("error", "Errors while creating Quiz: " + error.message);
        next(error);
    });
};

exports.update = function(req, res, next) {
    req.quiz.question = req.body.quiz.question;
    req.quiz.answer = req.body.quiz.answer;
    req.quiz.category = req.body.quiz.category;

    req.quiz.save({
        fields: ["question", "answer", "category"]
    }).then(function(quiz) {
        req.flash("success", "Quiz succesfully edited");
        res.redirect("/quizzes");
    }).catch(Sequelize.ValidationError, function(error) {

        req.flash("error", "Errors in form ");
        for (var i in error.errors) {
            req.flash("error", error.errors[i].value);
        }
        models.Category.findAll().then(function(categories) {
            if (categories) {
                res.render('quizzes/edit', {
                    quiz: req.quiz,
                    categories: categories
                });
            } else {
                throw new Error("Error loading Categories");
            }
        }).catch(function(error) {
            next(error);
        });

    }).catch(function(error) {
        req.flash("error", "Errors while editing Quiz: " + error.message);
        next(error);
    });
};

exports.edit = function(req, res, next) {
    var quiz = req.quiz;

    models.Category.findAll().then(function(categories) {
        if (categories) {
            req.categories = categories;
            res.render('quizzes/edit', {
                quiz: quiz,
                categories: categories
            });
        } else {
            throw new Error("Error loading Categories");
        }
    }).catch(function(error) {
        next(error);
    });
};
exports.destroy = function(req, res, next) {
    req.quiz.destroy().then(function() {
        req.flash("success", "Quizz succesfully deleted. ");
        res.redirect("/quizzes");
    }).catch(function(error) {
        req.flash("error", "Errors while deleting Quiz: " + error.message);
        next(error);
    });
};
