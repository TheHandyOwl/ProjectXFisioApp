'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const PushToken = mongoose.model('PushToken');

router.post('/', function (req, res, next) {

  const nuevo = {
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
