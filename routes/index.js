var express = require('express');
var router = express.Router();

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

module.exports = router;
