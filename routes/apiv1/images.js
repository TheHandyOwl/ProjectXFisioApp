var express = require('express');
var fs = require('fs');

var app = express();

app.get('/:type/:img', (req, res, next) => {

    var type = req.params.type;
    var img = req.params.img;
    console.log(req.params);

    var path = `./uploads/${ type }/${ img }`;

    fs.exists(path, exists => {

        if (!exists) {
            path = './assets/no-image.png';
        }

        res.sendfile(path);

    });

});

module.exports = app;