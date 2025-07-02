var express = require('express');
var router = express.Router();
const path = require("path");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/map/:filename', function(req, res, next) {
  const filename = req.params['filename']
  res.sendFile(path.resolve(__dirname, `../map/${filename}`))
});

router.get('/atlas/:filename', function(req, res, next) {
  const filename = req.params['filename']
  res.sendFile(path.resolve(__dirname, `../atlas/${filename}`))
});

router.get('/sounds/:filename', function(req, res, next) {
  const filename = req.params['filename']
  res.sendFile(path.resolve(__dirname, `../sounds/${filename}`))
});

module.exports = router;
