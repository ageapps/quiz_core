var models = require('../models');
var Sequelize = require('sequelize');
var url = require('url');


exports.new = function(req, res, next) {

    // get hiden field redir
    var redir = req.query.redir || url.parse(req.headers.referer || "/").pathname;

    if (redir === "/session" || redir === "users/new") {
        redir = "/";
    }

    res.render("session/new", {
        redir: redir
    });
};

exports.create = function(req, res, next) {

    var redir = req.body.redir || "/";
    var user_name = req.body.username;
    var password = req.body.password;

    // get authenticated user and save it in req.session instance
    authenticate(user_name, password).then(function(user) {
        if (user) {
            req.session.user = {
                id: user.id,
                username: user.username,
                isAdmin: user.isAdmin,
                mail: user.mail,
                Avatar: user.Avatar,
                Follower: user.Follower
            };
            res.redirect(redir);
        } else {
            req.flash("error", "Login failed. Try it again.");
            res.redirect("/session?redir=" + redir);
        }
    })

};

exports.destroy = function(req, res, next) {
    delete req.session.user;
    res.redirect("/session");

};

exports.loginRequired = function(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/session?redir=" + (req.param("redir") || req.url));
    }
};

var authenticate = function(username, password) {
    // find user through username and password including associated models
    return models.User.findOne({
        include: [{
            model: models.Avatar
        }, {
            model: models.User,
            as: 'Follower'
        }],
        where: {
            username: username
        }
    }).then(function(user) {
        if (user && user.confirmed && user.verifyPassword(password)) {
            return user;
        } else {
            return null;
        }
    });
};
