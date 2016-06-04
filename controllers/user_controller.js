var models = require('../models');
var Sequelize = require('sequelize');
var cloudinary = require('cloudinary');
var fs = require('fs');
var Promise = require('promise');

exports.load = function(req, res, next, userId) {

    models.User.findById(userId, {
        include: [{
            model: models.Quiz,
            include: [{
                model: models.Category,
                as: 'QuizCategories'
            }, {
                model: models.Attachment
            }, {
                model: models.Comment
            }]
        }]
    }).then(function(user) {
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
        mail: req.body.user.mail,
        password: req.body.user.password,
        foto: "/images/profile.png"
    });

    models.User.find({
            where: {
                username: req.body.user.username
            }
        })
        .then(function(existing_user) {
            if (existing_user) {
                var msg = "The user \"" + req.body.user.username + "\" allready exists."
                req.flash('error', msg);
                res.render('users/new', {
                    user: user
                });
            } else {
                return user.save({
                        fields: ["username", "password", "salt", "mail", "foto"]
                    })
                    .then(function(user) {
                        req.flash('success', 'User created succesfully');
                        res.redirect('/confirm/' + user.id);
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
        if (req.session.user && req.session.user.id == req.user.id) {
            delete req.session.user;
        }

        // Delete his comments
        models.Comment.findAll({
            where: {
                AuthorId: req.user.id
            }
        }).then(function(comments) {

          // Delete his quizzes, comment in quizzes and attachment
            var quizzes = req.user.Quizzes;
            quizzes.forEach(function(quiz) {
                console.log(JSON.stringify(quiz));
                if (quiz.Attachment) {
                    quiz.Attachment.destroy();
                }
                var comments = quiz.Comments;
                comments.forEach(function(comment) {
                    comment.destroy();
                });
                quiz.destroy();
            });
            console.log(JSON.stringify(comments));
            comments.forEach(function(comment) {
                comment.destroy();
            });

        });

        req.flash("success", "User deleted succesfully. His questions where also deleted ");
        res.redirect("/users");
    }).catch(function(error) {
        req.flash("error", "Errors while deleting User: " + error.message);
        next(error);
    });
};

exports.adminOrMyselfRequired = function(req, res, next) {
    var isAdmin = req.session.user.isAdmin;
    var userId = req.user.id;
    var loggedUserId = req.session.user.id;
    if (isAdmin || userId === loggedUserId) {
        next();
    } else {
        console.log("Denied access. The logged User is not the user or Administrator");
        res.send(403);
    }
};

exports.adminAndNotMyselfRequired = function(req, res, next) {
    var isAdmin = req.session.user.isAdmin;
    var userId = req.user.id;
    var loggedUserId = req.session.user.id;
    if (isAdmin || userId !== loggedUserId) {
        next();
    } else {
        console.log("Denied access. The logged User is not the user or Administrator");
        res.send(403);
    }

};

function uploadResourceToCloudinary(req) {
    return new Promise(function(resolve, reject) {
        var path = req.file.path;
        cloudinary.uploader.upload(path, function(result) {
                fs.unlink(path); // delete the uploaded image from ./uploads
                if (!result.error) {
                    resolve({
                        public_id: result.public_id,
                        url: result.secure_url
                    });
                } else {
                    req.flash('error', 'New image could not be stored: ' + result.error.message);
                    resolve(null);
                }
            },
            cloudinary_image_options
        );
    })
}

function updateAttachment(req, uploadResult, quiz) {
    if (!uploadResult) {
        return Promise.resolve();
    }

    // Recordar public_id de la imagen antigua.
    var old_public_id = quiz.Attachment ? quiz.Attachment.public_id : null;

    return quiz.getAttachment()
        .then(function(attachment) {
            if (!attachment) {
                attachment = models.Attachment.build({
                    QuizId: quiz.id
                });
            }
            attachment.public_id = uploadResult.public_id;
            attachment.url = uploadResult.url;
            attachment.filename = req.file.originalname;
            attachment.mime = req.file.mimetype;
            return attachment.save();
        })
        .then(function(attachment) {
            req.flash('success', 'Image uploaded succesfully.');
            if (old_public_id) {
                cloudinary.api.delete_resources(old_public_id);
            }
        })
        .catch(function(error) { // Ignoro errores de validacion en imagenes
            req.flash('error', 'Image could not be saved: ' + error.message);
            cloudinary.api.delete_resources(uploadResult.public_id);
        });
}


function createAttachment(req, uploadResult, quiz) {
    if (!uploadResult) {
        return Promise.resolve();
    }

    return models.Attachment.create({
            public_id: uploadResult.public_id,
            url: uploadResult.url,
            filename: req.file.originalname,
            mime: req.file.mimetype,
            QuizId: quiz.id
        })
        .then(function(attachment) {
            req.flash('success', 'Imagen nueva guardada con éxito.');
        })
        .catch(function(error) { // Ignoro errores de validacion en imagenes
            req.flash('error', 'No se ha podido salvar la nueva imagen: ' + error.message);
            cloudinary.api.delete_resources(uploadResult.public_id);
        });
}
