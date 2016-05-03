var express = require('express');
var router = express.Router();
var quizController = require('../controllers/quiz_controller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Quiz'
  , subtitle:'El portal donde podrá crear sus propios juegos!'});
//  res.render('index', { pepe:'El portal donde podrá crear sus propios juegos!' });
//res.render('index', { subtitle:'El portal donde podrá crear sus propios juegos!'});
});
router.get('/creditos', function(req,res,next){
  res.render('creditos', { title: 'Créditos'
  , subtitle1:'Te presento al autor',
subtitle2:'Y su video molon'});
});
router.get('/quizes', function(req,res,next){
  res.render('quizes', { title: 'Quizes'

  });
});


router.get("/question", quizController.question);
router.get("/check", quizController.check);
module.exports = router;
