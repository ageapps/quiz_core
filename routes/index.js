var express = require('express');
var router = express.Router();
var quizController = require('../controllers/quiz_controller');

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

// Autoload de rutas con quizId
router.param("quizId",quizController.load);

router.get("/quizzes", quizController.index);
router.get("/quizzes/search", quizController.search);
router.get("/quizzes/:quizId(\\d+)", quizController.question);
router.get("/quizzes/:quizId(\\d+)/check", quizController.check);
module.exports = router;
