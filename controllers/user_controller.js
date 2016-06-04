var models = require('../models');
var Sequelize = require('sequelize');
var cloudinary = require('cloudinary');
var fs = require('fs');
var Promise = require('promise');

var cloudinary_image_options = {
    crop: "limit",
    with: 200,
    height: 200,
    radius: 5,
    border: "0px_solid_blue",
    tags: ["core", "quiz-2016"]
};



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
        }, {
            model: models.Avatar
        }]
    }).then(function(user) {
        if (user) {
            console.log("-----------------USER-------------------");
            console.log(JSON.stringify(user));
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
                        fields: ["username", "password", "salt", "mail"]
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


exports.saveAvatar = function(req, res, next) {

    console.log(JSON.stringify(req.body));
    if (!req.file) {
        req.flash('info', 'User without Foto.');
        console.log("------------------NO FILE----------------------");
        if (req.user.Avatar) {
            cloudinary.api.delete_resources(user.Avatar.public_id);
            user.Avatar.destroy().then(function() {
                res.render('users/edit', {
                    user: req.user
                });
            });
        }
        res.render('users/edit', {
            user: req.user
        });
    } else {

        console.log("-------------save to clodinary----------------");

        // Save Image in Cloudinary
        return uploadResourceToCloudinary(req).then(function(uploadResult) {

            console.log("------------------UPLOADED----------------------");
            if (req.user.Avatar) {
                console.log("------------------Update----------------------");
                // Update Avatar in DB.
                return updateAvatar(req, uploadResult, req.user).then(function() {
                    req.flash("success", "User foto succesfully edited");
                    res.redirect("/users/" + req.user.id);
                });
            } else {
                console.log("------------------Create----------------------");
                // Create new Attachment in DB.
                return createAvatar(req, uploadResult, req.user);
            }

        }).then(function() {
            res.render('users/edit', {
                user: req.user
            });
        });

    }

}



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
            req.flash("success", "User succesfully edited");
            res.redirect("/users/" + user.id);
        }).catch(Sequelize.ValidationError, function(error) {

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

    // Delete image from Cloudinary
    if (req.user.Avatar) {
        cloudinary.api.delete_resources(req.user.Avatar.public_id);
    }

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
    console.log("uploadResourceToCloudinary");
    return new Promise(function(resolve, reject) {


        console.log("uploadResourceToCloudinary");
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

function updateAvatar(req, uploadResult, user) {
    console.log("updateAvatar");
    if (!uploadResult) {
        return Promise.resolve();
    }
    console.log("updateAvatar");
    // Recordar public_id de la imagen antigua.
    var old_public_id = user.Avatar ? user.Avatar.public_id : null;

    return user.getAvatar()
        .then(function(avatar) {
            if (!avatar) {
                avatar = models.Avatar.build({
                    UserId: user.id
                });
            }
            avatar.public_id = uploadResult.public_id;
            avatar.url = uploadResult.url;
            avatar.filename = req.file.originalname;
            avatar.mime = req.file.mimetype;
            return avatar.save();
        })
        .then(function(avatar) {
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


function createAvatar(req, uploadResult, user) {
    console.log("createAvatar");
    if (!uploadResult) {
        return Promise.resolve();
    }
    console.log("createAvatar");
    return models.Avatar.create({
            public_id: uploadResult.public_id,
            url: uploadResult.url,
            filename: req.file.originalname,
            mime: req.file.mimetype,
            UserId: user.id
        })
        .then(function(avatar) {
            req.flash('success', 'Image saved succesfully.');
        })
        .catch(function(error) { // Ignoro errores de validacion en imagenes
            req.flash('error', 'There was an error saving the image: ' + error.message);
            cloudinary.api.delete_resources(uploadResult.public_id);
        });
}
