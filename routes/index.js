var express = require('express');
var router = express.Router();
var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var userController = require('../controllers/user_controller');
var sessionController = require('../controllers/session_controller');



/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
    //  res.render('index', { pepe:'El portal donde podrá crear sus propios juegos!' });
    //res.render('index', { subtitle:'El portal donde podrá crear sus propios juegos!'});
});
router.get('/creditos', function(req, res, next) {
    res.render('creditos', {
        title: 'Créditos',
        subtitle1: 'Te presento al autor',
        subtitle2: 'Y su video molon'
    });
});

// autoload parameters
router.param("quizId", quizController.load);
router.param("userId", userController.load);
router.param("commentId", commentController.load);



// quiz_controller routes
router.get("/quizzes.:format?", quizController.index);
router.get("/quizzes/search", quizController.search);
router.get("/quizzes/:quizId(\\d+).:format?", quizController.question);
router.get("/quizzes/:quizId(\\d+)/check", quizController.check);
router.get("/quizzes/new", sessionController.loginRequired, quizController.new);
router.post("/quizzes", sessionController.loginRequired, quizController.create);
router.get("/quizzes/:quizId(\\d+)/edit", sessionController.loginRequired, quizController.ownershipRequired, quizController.edit);
router.put("/quizzes/:quizId(\\d+)", sessionController.loginRequired, quizController.ownershipRequired, quizController.update);
router.delete("/quizzes/:quizId(\\d+)", sessionController.loginRequired, quizController.ownershipRequired, quizController.destroy);

// comment_controller routes
router.post("/quizzes/:quizId(\\d+)/comments", sessionController.loginRequired, commentController.create);
router.put("/quizzes/:quizId(\\d+)/comments/:commentId(\\d+)/accept", sessionController.loginRequired, quizController.ownershipRequired, commentController.accept);

// user_controller routes
router.get('/users.:format?', userController.index);
router.get("/users/search", userController.search);
router.get('/users/:userId(\\d+).:format?', userController.user);
router.get('/users/new', userController.new);
router.post('/users', userController.create);
router.get('/users/:userId(\\d+)/edit',sessionController.loginRequired, userController.adminOrMyselfRequired, userController.edit);
router.put('/users/:userId(\\d+)', sessionController.loginRequired,userController.adminOrMyselfRequired, userController.update);
router.delete('/users/:userId(\\d+)', sessionController.loginRequired,userController.adminAndNotMyselfRequired, userController.destroy);

// session_controller routes
router.get('/session', sessionController.new);
router.post('/session', sessionController.create);
router.delete('/session', sessionController.destroy);



module.exports = router;
