'use strict';

let router = require('express').Router();
let fs = require('fs');

/* GET home page. */
router.get('/', function (req, res, next) {

  // read the README.md file
  fs.readFile(__dirname + '/../README.md', { encoding: 'utf8' }, (err, data)=> {
    if (err) return next(new Error(`Can't read README.md file`));
    res.render('index', { title: 'FisiApp', readme: data });
  });

});

module.exports = router;
