'use strict';

const express = require('express');
const Router = express.Router();
const Mongoose = require('mongoose');
const User = Mongoose.model('User');
const Product = Mongoose.model('Product');

// Auth con JWT
const jwtAuth = require('../../lib/jwtAuth');
Router.use(jwtAuth());

// Get all products by owner and not deleted

Router.get('/', (req, res, next) => {

  let filters = {};
  let priceFrom = req.query.pricefrom;
  let priceTo = req.query.priceto;
  let professional = req.query.professional;
  let id = req.query.id;

  if (id) {
    filters._id = req.query.id;

    const idOk = Mongoose.Types.ObjectId.isValid(req.query.id);
    if (idOk == false) return res
      .status(422)
      .json({
        ok: false,
        error: {
          code: 422,
          message: res.__('unprocessable_entity')
        }
      });
  }

  if (professional) {
    filters.professional = req.query.professional;
  }

  if (priceFrom && priceTo) {
    filters.price = { $gte: priceFrom, $lte: priceTo }
  }

  if (priceFrom && !priceTo) {
    filters.price = { $gte: priceFrom }
  }

  if (!priceFrom && priceTo) {
    filters.price = { $lte: priceTo }
  }

  filters.deleted = false; // Not deleted

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

  Product.list(start, limit, sort, includeTotal, filters, function (err, result) {
    if (err) return next(err);
    res.json({ ok: true, result: result });
  });
});

// Create a Product
Router.post('/', function (req, res, next) {
  // Check owner
  if ((req.body.professional != null) && (req.body.professional != req.decoded.user._id))  {
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

  Product.createRecord(req.body, function (err) {
    if (err) return next(err);

    // Product created
    return res
      .status(200)
      .json({
        ok: true,
        result: res.__('product_created')
      });
  });
});

// Update a product by owner and not deleted
Router.put('/:id', function (req, res, next) {

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

  if ((req.body.id != null) && (req.body.id != req.params.id))  {
    return res
      .status(422)
      .json({
        ok: false,
        error: {
          code: 422,
          message: res.__('unprocessable_entity')
        }
      });
  }

  if (req.body.professional != null) delete req.body.professional;

  Product.findOneAndUpdate({ _id: req.params.id, professional: req.decoded.user._id, deleted: false }, req.body, function (err, product) {
    if (err) return next(err);

    if (!product) {
      return res
        .status(401)
        .json({
          ok: false,
          error: {
            code: 401,
            message: res.__('product_not_found')
          }
        });
    } else if (product) {
      return res
        .status(200)
        .json({
          ok: true,
          result: res.__('product_updated')
        });
    }
  });

});

// Remove a product by owner and not deleted
Router.delete('/:id', function (req, res, next) {

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

  Product.findOneAndUpdate({ _id: req.params.id, professional: req.decoded.user._id, deleted: false }, { deleted: true }, function (err, product) {
    if (err) return next(err);

    if (!product) {
      return res
        .status(401)
        .json({
          ok: false,
          error: {
            code: 401,
            message: res.__('product_not_found')
          }
        });
    } else if (product) {
      return res
        .status(200)
        .json({
          ok: true,
          result: res.__('product_deleted')
        });
    }
  });
});

module.exports = Router;
