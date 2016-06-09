var models = require('../models');
var Sequelize = require('sequelize');
var cloudinary = require('cloudinary');
var fs = require('fs');
var Promise = require('promise');

var cloudinary_image_options = {
    crop: "limit",
    with: 200,
    height: 200,
    tags: ["core", "quiz-2016"]
};

exports.load = function(req, res, next, userId) {
    // find through userId including associated models
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
        }, {
            model: models.User,
            as: 'Follower',
            include: [{
                model: models.Avatar
            }, {
                model: models.Quiz
            }]
        }]
    }).then(function(user) {
        if (user) {
            // pre-load user in req
            req.user = user;
            //console.log(JSON.stringify(user));
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
            // JSON request
            res.json(users);
        } else {
            var search = ""; // no search text
            res.render('users/index', {
                users: users,
                indexTitle: "Look for Users",
                search: search
            });
        }
    }).catch(function(error) {
        next(error);
    });
};

exports.user = function(req, res, next) {
    if (req.params.format == "json") {
        // JSON request
        res.json(req.user);
    } else {
        var canfollow = checkFollowed(req);
        //console.log("Can follow " + canfollow);
        res.render("users/user", {
            user: req.user,
            canfollow: canfollow
        });
    }
};


exports.search = function(req, res, next) {
    var text = req.query.search || "";
    // find searched Users
    models.User.findAll({
        where: {
            username: {
                $like: "%" + text + "%"
            }
        }
    }).then(function(users) {
        res.render('users/index', {
            users: users,
            indexTitle: "Users found",
            search: text
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

    //console.log(JSON.stringify(req.body));
    if (!req.file) {
        req.flash('info', 'User Foto was deleted.');
        console.log("no file was uploaded");
        if (req.user.Avatar) {
            cloudinary.api.delete_resources(req.user.Avatar.public_id);
            req.user.Avatar.destroy().then(function() {
                req.session.user.Avatar = undefined;
                req.user.Avatar = undefined;
                res.render('users/edit', {
                    user: req.user
                });
                return;
            });
        }
        // update session instance
        req.user.Avatar = undefined;
        req.session.user.Avatar = undefined;
        res.render('users/edit', {
            user: req.user
        });
        return;
    } else {

        //console.log("saving to clodinary");

        // Save Image in Cloudinary
        return uploadResourceToCloudinary(req).then(function(uploadResult) {
            if (req.user.Avatar) {
                //console.log("updating user foto");
                // Update Avatar in DB.
                return updateAvatar(req, uploadResult, req.user).then(function() {
                    req.flash("success", "User foto succesfully edited");
                    res.render('users/edit', {
                        user: req.user
                    });
                });
            } else {
                //console.log("creating user foto");
                // Create new Attachment in DB.
                return createAvatar(req, uploadResult, req.user).then(function() {
                    req.flash("success", "User foto succesfully created");
                    res.render('users/edit', {
                        user: req.user
                    });
                });
            }
        });

    }

}



exports.update = function(req, res, next) {
    req.user.password = req.body.user.password;
    // check if username already exists
    var newUsername = req.body.user.username;
    models.User.findOne({
        where: {
            username: newUsername
        }
    }).then(function(user) {
        // if user found with the username is different that the actual user
        if (user && user.id !== req.user.id) {
            req.flash('error', "Username allready exists");
            return res.render('users/edit', {
                user: req.user
            });
        } else {
            req.user.username = newUsername;
            // Password can't be empty
            if (!req.body.user.password) {
                req.flash('error', "Password is missing.");
                return res.render('users/edit', {
                    user: req.user
                });
            }
            req.user.save({
                    fields: ["password", "salt", "username"]
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
                }).catch(function(error) {
                    next(error);
                });
        }
    }).catch(function(error) {
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
                if (quiz.Attachment) {
                    quiz.Attachment.destroy();
                }
                var comments = quiz.Comments;
                comments.forEach(function(comment) {
                    comment.destroy();
                });
                quiz.destroy();
            });
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

exports.follow = function(req, res, next) {
    var user = req.user;
    var loggedUser = req.session.user;

    // find through current logged id including associated models, the logged user
    models.User.findById(loggedUser.id, {
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
        }, {
            model: models.User,
            as: 'Follower'
        }]
    }).then(function(follower) {
        if (follower) {
            // add logged user to follower table from visited user
            user.addFollower(follower).then(function() {
                // console.log(JSON.stringify(user));
                req.flash('success', 'You are following ' + user.username);
                res.redirect("/users/" + user.id);

            });
        } else {
            throw new Error("Error Following " + user.username);
        }
    }).catch(function(error) {
        next(error);
    });
};
exports.unfollow = function(req, res, next) {
    var user = req.user;
    var loggedUser = req.session.user;
    // find through current logged id including associated models, the logged user
    models.User.findById(loggedUser.id, {
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
        }, {
            model: models.User,
            as: 'Follower'
        }]
    }).then(function(follower) {
        if (follower) {
            // remove logged user from follower table from visited user
            user.removeFollower(follower).then(function() {
                //console.log(JSON.stringify(user));
                req.flash('success', 'You stopped following ' + user.username);
                res.redirect("/users/" + user.id);
            });
        } else {
            throw new Error("Error UnFollowing " + user.username);
        }
    }).catch(function(error) {
        next(error);
    });
};


function uploadResourceToCloudinary(req) {
    return new Promise(function(resolve, reject) {

        //console.log("uploadResourceToCloudinary");
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
    //  console.log("updateAvatar");
    if (!uploadResult) {
        return Promise.resolve();
    }
    // Save public_id from old image.
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
            req.session.user.Avatar = avatar;
            req.user.Avatar = avatar;
            if (old_public_id) {
                cloudinary.api.delete_resources(old_public_id);
            }
        })
        .catch(function(error) { // Ignore validation errors
            req.flash('error', 'Image could not be saved: ' + error.message);
            cloudinary.api.delete_resources(uploadResult.public_id);
        });
}


function createAvatar(req, uploadResult, user) {
    //console.log("createAvatar");
    if (!uploadResult) {
        return Promise.resolve();
    }
    return models.Avatar.create({
            public_id: uploadResult.public_id,
            url: uploadResult.url,
            filename: req.file.originalname,
            mime: req.file.mimetype,
            UserId: user.id
        })
        .then(function(avatar) {
            req.session.user.Avatar = avatar;
            req.user.Avatar = avatar;
            req.flash('success', 'Image saved succesfully.');
        })
        .catch(function(error) { // Ignore validation errors
            req.flash('error', 'There was an error saving the image: ' + error.message);
            cloudinary.api.delete_resources(uploadResult.public_id);
        });
};

function checkFollowed(req) {
    var result = true;
    if (!req.session.user) {
        return false;
    }
    req.user.Follower.forEach(function(user) {
        if (user.id === req.session.user.id) {
            result = false;
        }
    });
    return result;
}
