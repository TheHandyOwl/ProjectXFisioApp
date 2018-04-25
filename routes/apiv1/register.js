'use strict';

const express = require('express');
const Router = express.Router();

const Mongoose = require('mongoose');
const User = Mongoose.model('User');


// User registration for new users

Router.post('/', function(req, res, next) {

    const email = req.body.email.toLowerCase();

    User.findOne({ email, deleted: false }, function(err, user) {
        if (err) return next(err);

        if (!user) {
            User.createRecord(req.body, function(err, user) {
                if (err) return next(err);

                // Delete password
                user.password = "🤔 👻 😜";

                // User created
                return res
                    .status(200)
                    .json({
                        ok: true,
                        result: user,
                        message: res.__('users_user_created')
                    });
            });
        } else if (user) {
            return res
                .status(409)
                .json({
                    ok: false,
                    error: {
                        code: 409,
                        message: res.__('user_email_duplicated')
                    }
                });
        }
    });
});

module.exports = Router;