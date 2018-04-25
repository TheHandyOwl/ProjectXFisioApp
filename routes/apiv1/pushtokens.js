'use strict';

const express = require('express');
const router = express.Router();

const Mongoose = require('mongoose');
const PushToken = Mongoose.model('PushToken');

router.post('/', function (req, res, next) {

  const nuevo = {
    token: req.body.pushtoken,
    user: req.body.iduser || undefined,
    platform: req.body.platform
  };

  PushToken.createRecord(nuevo, (err, created) => {
    if (err) return next(err);

    // return confirmation
    return res.json({ ok: true, created: created });
  });

});

module.exports = router;
