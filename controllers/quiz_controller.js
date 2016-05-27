/**
 * Created by adricacho on 3/5/16.
 */
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
    border: "3px_solid_blue",
    tags: ["core", "quiz-2016"]
};


exports.load = function(req, res, next, quizId) {
    // find quizz
    models.Quiz.findById(quizId, {
        include: [{
            model: models.Comment,
            include: [{
                model: models.User,
                as: "Author"
            }]
        }, {
            model: models.Attachment
        }, {
            model: models.Category,
            as: 'QuizCategories'
        }]
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

    models.Quiz.findAll({
        include: [{
            model: models.User,
            as: 'Author'
        }, {
            model: models.Category,
            as: 'QuizCategories'
        }, {
            model: models.Attachment
        }]
    }).then(function(quizzes) {
        if (req.params.format == "json") {
            res.json(quizzes);
        } else {
            // all quizzes
            var search = "";
            res.render('quizzes/index', {
                quizzes: quizzes,
                indexTitle: "Look for a Quizz",
                search: search
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
        console.log(JSON.stringify(req.quiz));
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
    var title = text ? "Quizzes Found" : "Look for a Quizz"
    models.Quiz.findAll({
        include: [{
            model: models.User,
            as: 'Author'
        }],
        where: {
            question: {
                $like: "%" + text + "%"
            }
        }
    }).then(function(quizzes) {
        if (req.params.format == "json") {
            res.json(quizzes);
        } else {
            res.render('quizzes/index', {
                quizzes: quizzes,
                indexTitle: title,
                search: text
            });
        }
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


    var authorId = req.session.user && req.session.user.id || 1;
    var quiz = models.Quiz.build({
        question: req.body.quiz.question,
        answer: req.body.quiz.answer,
        AuthorId: authorId
    });

    if (!req.file) {
        req.flash('info', 'Quiz without Image.');
    }
    if (!req.body.quiz.category) {
        req.flash("error", "Category missing");
        models.Category.findAll().then(function(categories) {
            res.render('quizzes/new', {
                quiz: quiz,
                categories: categories
            });
        });
        return;
    }

    quiz.save({
        fields: ["question", "answer", "AuthorId"]
    }).then(function(quiz) {
        // get Categories and save them to quiz
        models.Category.findAll({
            where: {
                id: req.body.quiz.category
            }
        }).then(function(categories) {

            req.flash("success", "Quiz succesfully created");
            quiz.addQuizCategories(categories).then(function() {
                if (!req.file) {
                    // No file
                    return;
                }

                // Save Image in Cloudinary
                return uploadResourceToCloudinary(req).then(function(uploadResult) {
                    // Create new Attachment in DB.
                    return createAttachment(req, uploadResult, quiz);
                });
            }).then(function() {
                res.redirect("/quizzes");
            });


        });
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

    req.quiz.save({
        fields: ["question", "answer"]
    }).then(function(quiz) {

        // get Categories and save them to quiz
        models.Category.findAll({
            where: {
                id: req.body.quiz.category
            }
        }).then(function(categories) {
            quiz.setQuizCategories(categories).then(function() {
                // Sin imagen: Eliminar attachment e imagen viejos.
                if (!req.file) {
                    req.flash('info', 'Quiz without Image.');
                    if (quiz.Attachment) {
                        cloudinary.api.delete_resources(quiz.Attachment.public_id);
                        return quiz.Attachment.destroy();
                    }
                    return;
                }
                // Save Image in Cloudinary
                return uploadResourceToCloudinary(req).then(function(uploadResult) {
                    // Update Attachment in DB.
                    return updateAttachment(req, uploadResult, quiz).then(function() {
                        console.log("categories saved succesfully");
                        req.flash("success", "Quiz succesfully edited");
                        res.redirect("/quizzes");
                    });
                });
            });
        });
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

    // Delete image from Cloudinary
    if (req.quiz.Attachment) {
        cloudinary.api.delete_resources(req.quiz.Attachment.public_id);
    }


    req.quiz.destroy().then(function() {
        req.flash("success", "Quizz succesfully deleted. ");
        res.redirect("/quizzes");
    }).catch(function(error) {
        req.flash("error", "Errors while deleting Quiz: " + error.message);
        next(error);
    });
};

exports.ownershipRequired = function(req, res, next, quizId) {

    var isAdmin = req.session.user.isAdmin;
    var quizAuthorId = req.quiz.AuthorId;
    var loggedUserId = req.session.user.id;

    if (isAdmin || quizAuthorId === loggedUserId) {
        next();
    } else {
        console.log("Denied operation. The logged User is not the owner or Administrator");
        res.send(403);
    }
}

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
