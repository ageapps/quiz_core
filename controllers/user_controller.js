var models = require('../models');
var Sequelize = require('sequelize');

exports.load = function(req, res, next, userId) {

    models.User.findById(userId).then(function(user) {
        if (user) {
            req.user = user;
            next();
        } else {
            throw new Error(userId + "Does not exist");
        }
    }).catch(function(error) {
        next(error);
    });
};
exports.index = function(req, res, next) {
    models.User.findAll().then(function(users) {
        if (req.params.format == "json") {
            res.json(users);
        } else {
            res.render('users/index', {
                users: users,
                indexTitle: "Look for Users"
            });
        }
    }).catch(function(error) {
        next(error);
    });
};

exports.user = function(req, res, next) {
    if (req.params.format == "json") {
        res.json(req.user);
    } else {
        var answer = req.query.answer || "";
        res.render("users/user", {
            user: req.user,
        });
    }
};
exports.search = function(req, res, next) {
    var text = req.query.search || "";
    models.User.findAll({
        where: {
            username: {
                $like: "%" + text + "%"
            }
        }
    }).then(function(users) {
        res.render('users/index', {
            users: users,
            indexTitle: "Users found"
        });
    }).catch(function(error) {
        next(error);
    });

};
exports.new = function(req, res, next) {
    var user = models.User.build({
        username: "",
        password: ""
    });
    res.render('users/new', {
        user: user
    });
};

exports.create = function(req, res, next) {
    var user = models.User.build({
        username: req.body.user.username,
        password: req.body.user.password
    });

    models.User.find({
            where: {
                username: req.body.user.username
            }
        })
        .then(function(existing_user) {
            if (existing_user) {
                var msg = "El usuario \"" + req.body.user.username + "\" allready exists."
                req.flash('error', msg);
                res.render('users/new', {
                    user: user
                });
            } else {
                return user.save({
                        fields: ["username", "password", "salt"]
                    })
                    .then(function(user) {
                        req.flash('success', 'User created succesfully');
                        res.redirect('/users');
                    })
                    .catch(Sequelize.ValidationError, function(error) {
                        req.flash('error', 'Errors in form:');
                        for (var i in error.errors) {
                            req.flash('error', error.errors[i].value);
                        };
                        res.render('users/new', {
                            user: user
                        });
                    });
            }
        })
        .catch(function(error) {
            next(error);
        });
};

exports.update = function(req, res, next) {

    req.user.password = req.body.user.password;

    // El password no puede estar vacio
    if (!req.body.user.password) {
        req.flash('error', "Password is missing.");
        return res.render('users/edit', {
            user: req.user
        });
    }

    req.user.save({
            fields: ["password", "salt"]
        })
        .then(function(user) {
            req.flash('success', 'User edited succesfully');
            res.redirect('/users');
        })
        .catch(Sequelize.ValidationError, function(error) {

            req.flash('error', 'Errors in form:');
            for (var i in error.errors) {
                req.flash('error', error.errors[i].value);
            };

            res.render('users/edit', {
                user: req.user
            });
        })
        .catch(function(error) {
            next(error);
        });
};

exports.edit = function(req, res, next) {
    var user = req.user;

    res.render('users/edit', {
        user: user,
    });

};
exports.destroy = function(req, res, next) {
    req.user.destroy().then(function() {
        req.flash("success", "User deleted succesfully . ");
        res.redirect("/users");
    }).catch(function(error) {
        req.flash("error", "Errors while deleting User: " + error.message);
        next(error);
    });
};