var express = require("express");
var fs = require("fs");

var app = express();

const path = require("path");

app.get("/:type/:img", (req, res, next) => {
    var type = req.params.type;
    var img = req.params.img;
    console.log(req.params);

    var pathImage = path.resolve(__dirname, `../../uploads/${type}/${img}`);

    if (fs.existsSync(pathImage)) {
        res.sendFile(pathImage);
    } else {
        const pathNoImage = path.resolve(__dirname, "../../assets/no-image.png");
        res.sendFile(pathNoImage);
    }
});

module.exports = app;