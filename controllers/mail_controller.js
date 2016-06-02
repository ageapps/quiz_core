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
                        req.flash('success', 'User was confirmed succesfully');
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


exports.mail = function(req, res, next) {



    var fullUrl = req.protocol + '://' + req.get('host');

    //console.log(fullUrl);

    var mailOptions = {
        from: 'Quizz  <age.quiz@gmail.com>', // sender address
        to: req.user.mail, // list of receivers
        subject: 'Welcome to QUIZ!  Email Confirmation 📩 ', // Subject line
        text: +'Hello ' + req.user.username + '  👤 !\n' + 'Thank you for signing up to QUIZ!\n', // plaintext body
        html: '<div><img src="' + fullUrl + '/images/quiz.png"><br><br>' + 'Hello <strong>' + req.user.username + '</strong> 👤 !<br>' + '<p>Thank you for signing up to QUIZ!</p>' + '<p> Click on this ' + '<a href="'+ fullUrl + '/confirm?code=' + encrypt("" + req.user.id) + '"> Link </a>' + ' to confirm your Quizz account. </p>' // html body
            + '<a href="' + fullUrl + '">Start making your own quizzes!</a></div>'
    };


    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            req.flash("error", "Error sending validation mail");
            res.redirect("/session");
            console.log("Error sending mail" + error);
        } else {
            console.log('Message sent: ' + info.response);
            req.flash('info', 'Email with confirmation was sent');
            res.redirect("/session");
        }
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
