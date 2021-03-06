var express = require('express');
var router = express.Router();
var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var userController = require('../controllers/user_controller');
var sessionController = require('../controllers/session_controller');
var categoryContoller = require('../controllers/category_controller');
var mailContoller = require('../controllers/mail_controller');


var multer = require('multer');
var upload = multer({
    dest: "./uploads/"
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});

/* GET author page. */
router.get('/creditos', function(req, res, next) {
    res.render('credits', {
        title: 'Credits',
        subtitle1: 'Meet the Author',
    });
});

// autoload parameters
router.param("quizId", quizController.load);
router.param("userId", userController.load);
router.param("commentId", commentController.load);
router.param("categoryId", categoryContoller.load);
router.param("userMailId", mailContoller.load);

// quiz_controller routes
router.get("/quizzes.:format?", quizController.index);
router.get("/quizzes/search", quizController.search);
router.get("/quizzes/:quizId(\\d+).:format?", quizController.question);
router.get("/quizzes/:quizId(\\d+)/check", quizController.check);
router.get("/quizzes/new", sessionController.loginRequired, quizController.new);
router.post("/quizzes", sessionController.loginRequired, upload.single("image"), quizController.create);
router.get("/quizzes/:quizId(\\d+)/edit", sessionController.loginRequired, quizController.ownershipRequired, quizController.edit);
router.put("/quizzes/:quizId(\\d+)", sessionController.loginRequired, quizController.ownershipRequired, upload.single("image"), quizController.update);
router.delete("/quizzes/:quizId(\\d+)", sessionController.loginRequired, quizController.ownershipRequired, quizController.destroy);

// comment_controller routes
router.post("/quizzes/:quizId(\\d+)/comments", sessionController.loginRequired, commentController.create);
router.put("/quizzes/:quizId(\\d+)/comments/:commentId(\\d+)/accept", sessionController.loginRequired, quizController.ownershipRequired, commentController.accept);
router.delete("/quizzes/:quizId(\\d+)/comments/:commentId(\\d+)", sessionController.loginRequired, quizController.ownershipRequired, commentController.destroy);

// user_controller routes
router.get('/users.:format?', userController.index);
router.get("/users/search.:format?", userController.search);
router.get('/users/:userId(\\d+).:format?', userController.user);
router.get('/users/new', userController.new);
router.post('/users', userController.create);
router.post('/users/:userId(\\d+)', sessionController.loginRequired, userController.adminOrMyselfRequired, upload.single("image"), userController.saveAvatar);
router.get('/users/:userId(\\d+)/edit', sessionController.loginRequired, userController.adminOrMyselfRequired, userController.edit);
router.put('/users/:userId(\\d+)', sessionController.loginRequired, userController.adminOrMyselfRequired, userController.update);
router.delete('/users/:userId(\\d+)', sessionController.loginRequired, userController.adminAndNotMyselfRequired, userController.destroy);
router.post('/users/:userId(\\d+)/follow', sessionController.loginRequired, userController.follow);
router.delete('/users/:userId(\\d+)/follow', sessionController.loginRequired, userController.unfollow);

// mail_controller routes
router.get('/confirm', mailContoller.confirm);
router.get('/confirm/:userMailId(\\d+)', mailContoller.confirmationMail);
router.get('/notify/:commentMailId(\\d+)', mailContoller.notify);

// session_controller routes
router.get('/session', sessionController.new);
router.post('/session', sessionController.create);
router.delete('/session', sessionController.destroy);

// category_controller routes
router.get('/category.:format?', categoryContoller.index);
router.get('/category/search.:format?', categoryContoller.search);
router.get('/category/:categoryId(\\d+).:format?', categoryContoller.category);
router.get('/category/:categoryId(\\d+)/search.:format?', categoryContoller.searchInCategory);

module.exports = router;
