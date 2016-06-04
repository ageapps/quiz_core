var models = require('../models');
var Sequelize = require('sequelize');
var crypto = require('crypto');
var nodemailer = require('nodemailer');


// login
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'age.quiz@gmail.com',
        pass: 'core_quiz_16'
    }
});

exports.load = function(req, res, next, userMailId) {
    models.User.findById(userMailId).then(function(user) {
        if (user) {
            req.user = user;
            console.log(JSON.stringify(user));
            next();
        } else {
            throw new Error(userMailId + "Does not exist");
        }
    }).catch(function(error) {
        next(error);
    });
};


exports.confirm = function(req, res, next) {

    var encriptedId = req.query.code;
    if (encriptedId) {
        var id = decrypt(encriptedId);
        if (id) {
            models.User.findOne({
                where: {
                    id: id
                }
            }).then(function(user) {
                if (user && !user.confirmed) {
                    user.confirmed = true;
                    user.save(["confirmed"]).then(function(user) {
                        req.flash('success', 'Your account was confirmed succesfully');
                        res.redirect("/session");
                    }).catch(function(error) {
                        req.flash("error", "Errors while confirming User: " + error.message);
                        next(error);
                    });
                } else {
                    req.flash("error", "Error validating acount ");
                    res.redirect("/session");
                }
            });
        } else {
            req.flash("error", "Errors in validation ");
            res.redirect("/session");
        }

    } else {
        req.flash("error", "Wrong validation");
        res.redirect("/session");
    }
};


exports.confirmationMail = function(req, res, next) {
    var fullUrl = req.protocol + '://' + req.get('host');

    //console.log(fullUrl);
    var confirmationLink = fullUrl + '/confirm?code=' + encrypt("" + req.user.id);

    var mailOptions = {
        from: 'Quizz  <age.quiz@gmail.com>', // sender address
        to: req.user.mail, // list of receivers
        subject: 'Welcome to QUIZ!  Email Confirmation 📩 ', // Subject line
        text: 'Hello ' + req.user.username + '  👤 !\n' + 'Thank you for signing up to QUIZ!\n', // plaintext body
        html: '<div><img src="' + fullUrl + '/images/nav_logo.png">' + '<p>Hello <strong>'
        + req.user.username + '</strong> 👤 !</p>' + '<p>Thank you for signing up to QUIZ!</p>'
        + '<p> Click on this ' + '<a href="' + confirmationLink + '"> Link </a>'
        + ' to confirm your Quizz account. </p>'
        + '<p>If this link doesn´t work, copy this url and paste it in your browser</p>'
        + '<p>' + confirmationLink + '</p>' // html body
            + '<p><a href="' + fullUrl + '">Start making your own quizzes!</a></p></div>'
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            req.flash("error", "Error sending validation mail");
            res.redirect("/session");
            console.log("Error sending mail" + error);
        } else {
            console.log('Message sent: ' + info.response);
            req.flash('info', 'Email with confirmation was sent, confirm your email to acces Quiz');
            res.redirect("/session");
        }
    });
};

exports.notify = function(req, res, next) {

    models.Comment.findById(req.params.commentMailId, {
        include: [{
            model: models.User,
            as: "Author"
        }, {
            model: models.Quiz,
            include: [{
                model: models.User,
                as: 'Author'
            }]
        }]
    }).then(function(comment) {
        if (comment) {

            var fullUrl = req.protocol + '://' + req.get('host');

            var userUrl = fullUrl + '/users/' + comment.AuthorId;

            //console.log(fullUrl);
            var notificationLink = fullUrl + '/quizzes/' + comment.QuizId;

            var QuizAuthor = comment.Quiz.Author;
            var ComentAuthor = comment.Author.username;

            console.log(JSON.stringify(QuizAuthor));
            console.log(JSON.stringify(ComentAuthor));

            var mailOptionsNotify = {
                from: 'Quizz  <age.quiz@gmail.com>', // sender address
                to: QuizAuthor.mail, // list of receivers
                subject: 'Notification Mail  📢', // Subject line
                text: ComentAuthor + '👤 posted a comment on your <a href="'+ notificationLink + '"> Quizz </a>!!!', // plaintext body
                html: '<div><img src="' + fullUrl + '/images/nav_logo.png">'
                + '<p>Hello <strong>' + QuizAuthor.username
                + '</strong> 👤 !</p>' + '<p><a href="'
                + userUrl + '"> ' + ComentAuthor
                + '</a> posted a comment on your Quizz!!! </p>' + '<p> It won´t be published until you accept it, visit this'
                + '<a href="' + notificationLink + '"> link </a>'
                + ' to see the comment and accept it. </p>'
                + '<p>If this link doesn´t work, copy this url and paste it in your browser</p>'
                + '<p><a href="' + notificationLink + '">' + notificationLink + '</a></p>' // html body
                + '<p><a href="' + fullUrl + '">Start making your own quizzes!</a></p></div>'
            };

            console.log(mailOptionsNotify);

            transporter.sendMail(mailOptionsNotify, function(error, info) {
                if (error) {
                    req.flash("error", "Error sending notification mail");
                    res.redirect('/quizzes/' + comment.QuizId);
                    console.log("Error sending mail" + error);
                } else {
                    console.log('Message sent: ' + info.response);
                    req.flash('info', 'Your comment won´t be published until the owner accepts it!');
                    res.redirect('/quizzes/' + comment.QuizId);
                }
            });

        } else {
            throw new Error("Errors while sending notification mail");
        }
    }).catch(function(error) {
        next(error);
    });
};



function encrypt(text) {
    var cipher = crypto.createCipher('aes-256-cbc', 'sj3823n2jIn')
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
};

function decrypt(text) {
    var decipher = crypto.createDecipher('aes-256-cbc', 'sj3823n2jIn')
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
};
