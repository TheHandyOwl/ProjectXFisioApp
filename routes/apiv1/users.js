'use strict';

const express = require('express');
const Router = express.Router();

const Mongoose = require('mongoose');
const User = Mongoose.model('User');

const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const hash = require('hash.js');

const configDBUsersFields = require('./../../config/config').db.users;


// Auth con JWT
const jwtAuth = require('../../lib/jwtAuth');
Router.use(jwtAuth());


/*** AUX, it will be removed ***/
Router.get('/', (req, res, next) => {

    const filters = {};
    let id = req.query.id;
    let name = req.query.name;
    let lastName = req.query.lastName;

    filters.deleted = false; // Not deleted
    // filters.isProfessional = true; // Only professionals

    if (id) filters._id = id;
    if (name) filters.name = name;
    if (lastName) filters.lastName = lastName;

    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 1000; // Our API returns max 1000 registers
    const sort = req.query.sort || 'name';
    const includeTotal = req.query.includeTotal === 'true';

    if (typeof req.query.status !== 'undefined') {
        filters.status = req.query.status;
    }

    if (typeof req.query.description !== 'undefined') {
        filters.description = new RegExp('^' + req.query.description, 'i');
    }

    User.list(start, limit, sort, includeTotal, filters, function(err, result) {
        if (err) return next(err);
        res.json({ ok: true, result: result });
    });
});

// Find user by id

Router.get('/:id', (req, res, next) => {

    const idOk = Mongoose.Types.ObjectId.isValid(req.params.id);
    if (idOk == false) return res
        .status(422)
        .json({
            ok: false,
            error: {
                code: 422,
                message: res.__('unprocessable_entity')
            }
        });

    // Custom fields on query
    let queryFields = "";
    if (req.params.id != req.decoded.user._id) {
        // Public information fields - All people
        queryFields = configDBUsersFields.userPublicFields || '_id';
    } else {
        // Private information fields - Owner
        queryFields = configDBUsersFields.userPrivateFields || '_id';
    }

    User.findOne({ _id: req.params.id, deleted: false }, queryFields, function(err, user) {
        if (err) return next(err);

        if (!user) {
            return res
                .status(404)
                .json({
                    ok: false,
                    error: {
                        code: 404,
                        message: res.__('users_user_not_found')
                    }
                });
        } else if (user) {
            return res
                .status(200)
                .json({
                    ok: true,
                    result: user
                });
        }
    });
});

// Remove user by owner and not deleted
Router.delete('/:id', function(req, res, next) {

    const idOk = Mongoose.Types.ObjectId.isValid(req.params.id);
    if (idOk == false) return res
        .status(422)
        .json({
            ok: false,
            error: {
                code: 422,
                message: res.__('unprocessable_entity')
            }
        });

    // Check owner
    if (req.params.id != req.decoded.user._id) {
        return res
            .status(403)
            .json({
                ok: false,
                error: {
                    code: 403,
                    message: res.__('forbidden_access')
                }
            });
    }

    User.findOne({ _id: req.params.id, deleted: false }, function(err, user) {
        if (err) return next(err);

        if (!user) {
            return res
                .status(404)
                .json({
                    ok: false,
                    error: {
                        code: 404,
                        message: res.__('user_not_found')
                    }
                });
        } else if (user) {

            // if the password and the token are correct, we can remove the user information
            const hashedPassword = hash.sha256().update(req.body.password).digest('hex');
            if (hashedPassword === user.password) {
                User.findOneAndUpdate({ _id: user._id }, { deleted: true }, { new: true },
                    function(err, user) {
                        if (err) return next(err);

                        return res
                            .status(200)
                            .json({
                                ok: true,
                                result: user,
                                message: res.__('user_deleted')
                            });
                    })
            } else {
                return res
                    .status(401)
                    .json({
                        ok: false,
                        error: {
                            code: 401,
                            message: res.__('user_or_password_incorrect')
                        }
                    });
            }
        }
    });
});

// Update a user
Router.put('/:id', function(req, res, next) {
    req.body.id = req.params.id;

    const idOk = Mongoose.Types.ObjectId.isValid(req.params.id);
    if (idOk == false) return res
        .status(422)
        .json({
            ok: false,
            error: {
                code: 422,
                message: res.__('unprocessable_entity')
            }
        });

    if (req.params.id != req.decoded.user._id) {
        return res
            .status(403)
            .json({
                ok: false,
                error: {
                    code: 403,
                    message: res.__('forbidden_access')
                }
            });
    }

    if (req.body.professional != null) delete req.body.professional;

    User.findOneAndUpdate({ _id: req.params.id, deleted: false },
        req.body, { new: true },
        function(err, user) {
            if (err) return next(err);

            if (!user) {
                return res
                    .status(404)
                    .json({
                        ok: false,
                        error: {
                            code: 404,
                            message: res.__('user_not_found')
                        }
                    });
            } else if (user) {
                return res
                    .status(200)
                    .json({
                        ok: true,
                        result: user,
                        message: res.__('user_updated')
                    });
            }
        });
});

module.exports = Router;