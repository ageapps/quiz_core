var express = require('express');
var router = express.Router();
var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var userController = require('../controllers/user_controller');


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

router.param("quizId", quizController.load);
router.param("userId", userController.load);



router.get("/quizzes.:format?", quizController.index);
router.get("/quizzes/search", quizController.search);
router.get("/quizzes/:quizId(\\d+).:format?", quizController.question);
router.get("/quizzes/:quizId(\\d+)/check", quizController.check);
router.get("/quizzes/new", quizController.new);
router.post("/quizzes", quizController.create);
router.get("/quizzes/:quizId(\\d+)/edit", quizController.edit);
router.put("/quizzes/:quizId(\\d+)", quizController.update);
router.delete("/quizzes/:quizId(\\d+)", quizController.destroy);

router.post("/quizzes/:quizId(\\d+)/comments", commentController.create);


router.get('/users.:format?', userController.index);
router.get("/users/search", userController.search);
router.get('/users/:userId(\\d+).:format?', userController.user);
router.get('/users/new', userController.new);
router.post('/users', userController.create);
router.get('/users/:userId(\\d+)/edit', userController.edit);
router.put('/users/:userId(\\d+)', userController.update);
router.delete('/users/:userId(\\d+)', userController.destroy);

module.exports = router;
