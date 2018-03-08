'use strict';

let express = require('express');
let router = express.Router();

let mongoose = require('mongoose');
let PushToken = mongoose.model('PushToken');

router.post('/', function (req, res, next) {

  let nuevo = {
    token: req.body.pushtoken,
    user: req.body.iduser || undefined,
    plataforma: req.body.plataforma
  };

  PushToken.createRecord(nuevo, (err, creado) => {
    if (err) return next(err);

    // return confirmation
    return res.json({ ok: true, created: creado });
  });

});

module.exports = router;
