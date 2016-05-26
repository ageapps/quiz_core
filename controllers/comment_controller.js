var models = require('../models');
var Sequelize = require('sequelize');


exports.load = function(req, res, next, commentId) {
    // find comment
    models.Comment.findById(commentId).then(function(comment) {
        if (comment) {
            req.comment = comment;
            next();
        } else {
            throw new Error(commentId + "Does not exist");
        }
    }).catch(function(error) {
        next(error);
    });
}


exports.create = function(req, res, next) {

  var authorId = req.session.user && req.session.user.id || 1;

    var comment = models.Comment.build({
        text: req.body.comment.text,
        QuizId: req.quiz.id,
        AuthorId: authorId
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

exports.destroy = function(req, res, next) {

    req.comment.destroy().then(function() {
        req.flash("success", "Comment succesfully deleted. ");
        res.redirect("/quizzes/" + req.params.quizId);
    }).catch(function(error) {
        req.flash("error", "Errors while deleting Comment: " + error.message);
        next(error);
    });
};


exports.accept = function(req, res, next) {
    req.comment.accepted = true;

    req.comment.save(["accepted"]).then(function(comment) {
        req.flash("succes", "Comment accepted succesfully");
        res.redirect("/quizzes/" + req.params.quizId);
    }).catch(function(error) {
        req.flash("error", "Errors while accepting Comment: " + error.message);
        next(error);
    });
}
