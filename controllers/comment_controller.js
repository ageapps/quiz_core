var models = require('../models');
var Sequelize = require('sequelize');

exports.create = function(req, res, next) {
    var comment = models.Comment.build({
        text: req.body.comment.text,
        QuizId: req.quiz.id
    });

    comment.save().then(function(comment) {
        req.flash("success", "Comment succesfully added");
        res.redirect("/quizzes/" + req.quiz.id);
    }).catch(Sequelize.ValidationError, function(error) {

        req.flash("error", "You comment was empty ");
        res.redirect("/quizzes/" + req.quiz.id);

    }).catch(function(error) {
        req.flash("error", "Errors while adding Comment: " + error.message);
        next(error);
    });
};
