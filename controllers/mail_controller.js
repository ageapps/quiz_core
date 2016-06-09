var models = require('../models');
var Sequelize = require('sequelize');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

// Create transporter with credentials for sending emails through Gmail
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'age.quiz@gmail.com',
        pass: process.env.MAIL_PASSWORD
    }
});

exports.load = function(req, res, next, userMailId) {
    // find through userMailId, the email receiver
    models.User.findById(userMailId).then(function(user) {
        if (user) {
            // pre-load user in req
            req.user = user;
            //console.log(JSON.stringify(user));
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
            // find user through the id from the confirmation code
            models.User.findOne({
                where: {
                    id: id
                }
            }).then(function(user) {
                // if the user exists and is not already confirmed
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
                    req.flash("error", "Error validating acount, perhaps this account was already validated");
                    res.redirect("/session");
                }
            });
        } else {
            req.flash("error", "Errors in validation");
            res.redirect("/session");
        }

    } else {
        req.flash("error", "Wrong validation");
        res.redirect("/session");
    }
};


exports.confirmationMail = function(req, res, next) {

    // get root url
    var fullUrl = req.protocol + '://' + req.get('host');
    // build validation link
    var confirmationLink = fullUrl + '/confirm?code=' + encrypt("" + req.user.id);
    // build mail body
    var mailOptions = {
        from: 'Quizz  <age.quiz@gmail.com>', // sender address
        to: req.user.mail, // list of receivers
        subject: 'Welcome to QUIZ!  Email Confirmation 📩 ', // Subject line
        text: 'Hello ' + req.user.username + '  👤 !\n' + 'Thank you for signing up to QUIZ!\n', // plaintext body
        html: '<div><img src="' + fullUrl + '/images/nav_logo.png">' + '<p>Hello <strong>' +
            req.user.username + '</strong> 👤 !</p>' + '<p>Thank you for signing up to QUIZ!</p>' +
            '<p> Click on this ' + '<a href="' + confirmationLink + '"> Link </a>' +
            ' to confirm your Quizz account. </p>' +
            '<p>If this link doesn´t work, copy this url and paste it in your browser</p>' +
            '<p>' + confirmationLink + '</p>' + // html body
            '<p><a href="' + fullUrl + '">Start making your own quizzes!</a></p></div>'
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            req.flash("error", "Error sending validation mail");
            res.redirect("/session");
            console.log("Error sending mail" + error);

        } else {
            req.flash('info', 'Email with confirmation was sent, confirm your email to acces Quiz');
            res.redirect("/session");
            console.log('Message sent: ' + info.response);
        }
    });
};

exports.notify = function(req, res, next) {

    // find through commentMailId, the comment that creates the notification including associated models
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
            // get root url
            var fullUrl = req.protocol + '://' + req.get('host');
            // build user link
            var userUrl = fullUrl + '/users/' + comment.AuthorId;

            // build quiz link
            var notificationLink = fullUrl + '/quizzes/' + comment.QuizId;

            // get User Instances from comment
            var QuizAuthor = comment.Quiz.Author;
            var ComentAuthor = comment.Author;

            //console.log(JSON.stringify(QuizAuthor));
            //console.log(JSON.stringify(ComentAuthor));

            // build mail body
            var mailOptionsNotify = {
                from: 'Quizz  <age.quiz@gmail.com>', // sender address
                to: QuizAuthor.mail, // list of receivers
                subject: 'Notification Mail  📢', // Subject line
                text: ComentAuthor.username + '👤 posted a comment on your <a href="' + notificationLink + '"> Quizz </a>!!!', // plaintext body
                html: '<div><img src="' + fullUrl + '/images/nav_logo.png">' +
                    '<p>Hello <strong>' + QuizAuthor.username +
                    '</strong> 👤 !</p>' + '<p><a href="' +
                    userUrl + '"> ' + ComentAuthor.username +
                    '</a> posted a comment on your Quizz!!! </p>' + '<p> It won´t be published until you accept it, visit this' +
                    '<a href="' + notificationLink + '"> link </a>' +
                    ' to see the comment and accept it. </p>' +
                    '<p>If this link doesn´t work, copy this url and paste it in your browser</p>' +
                    '<p><a href="' + notificationLink + '">' + notificationLink + '</a></p>' + // html body
                    '<p><a href="' + fullUrl + '">Start making your own quizzes!</a></p></div>'
            };

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


// Encripts user id to attach it in the validation link
function encrypt(text) {
    var cipher = crypto.createCipher('aes-256-cbc', 'sj3823n2jIn')
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
};

// Decripts user code to extract the id in the validation link
function decrypt(text) {
    var decipher = crypto.createDecipher('aes-256-cbc', 'sj3823n2jIn')
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
};
