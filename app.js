var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var session = require('express-session');
var flash = require('express-flash');
var methodOverRide = require('method-override');
var routes = require('./routes/index');
var url = require('url');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(session({
    secret: "QuizAdri 2016",
    resave: false,
    saveUninitialized: true
}));

app.use(methodOverRide('_method', {
    methods: ["POST", "GET"]
}));
app.use(express.static(path.join(__dirname, '/public')));

//  (web).../assets  == /bower_components (server)
app.use('/assets', express.static(__dirname + '/bower_components'));
app.use(partials());
app.use(flash());

// req.session avaliable in views
app.use(function(req, res, next) {  
    res.locals.session = req.session;
    res.locals.url = req.url;

    next();
});

// Autologout
app.use(function(req, res, next) {
    if (req.session.user) {
        // Check if time is out
        console.log("sessionStart: " + req.session.user.sessionStart );
        console.log("DeltaTime: " + (new Date().getTime() - req.session.user.sessionStart) );
        if (req.session.user.sessionStart && ((new Date().getTime() - req.session.user.sessionStart) > 120000)) {
            // Logout logged user
            req.session.user = undefined;
            req.flash("error", "User was logged out for inactivity");
            console.log("------------------User was logged out--------------------");
        } else {
            // Restart time
            req.session.user.sessionStart = new Date().getTime();
        }

    }
    next();
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
if (app.get('env') === 'production') {
    app.use(function(err, req, res, next) {
        if (req.headers["x-forwarded-proto"] !== "https") {
            res.redirect("https://" + req.get("Host") + req.url);
        } else {
            next();
        }
    });
}


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
