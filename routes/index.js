var express = require('express');
var router = express.Router();
var getPerformance = require('../controllers/natation');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET natation page. */
router.get('/natation', getPerformance);

module.exports = router;