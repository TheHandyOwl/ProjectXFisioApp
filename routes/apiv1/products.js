'use strict';

const express = require('express');
const Router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Product = mongoose.model('Product');

// Auth con JWT
const jwtAuth = require('../../lib/jwtAuth');
Router.use(jwtAuth());

// Get all products by owner and not deleted

Router.get('/', (req, res, next) => {

  let filters = {};
  filters.professional = req.decoded.user._id; // Check owner
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

// Get a product by owner and not deleted

Router.get('/:id', (req, res, next) => {

  // Find product by owner and not deleted
  Product.findOne( { _id: req.params.id, professional: req.decoded.user._id, deleted: false }, function (err, product) {
    if (err) return next(err);

    if (!product) {
      return res.json({
        ok: false, error: {
          code: 401,
          message: res.__('product_not_found')
        }
      });
    } else if (product) {
      User.populate( product, { path: 'professional' }, function(err, productAndProfessional) {
        res.json({ ok: true, result: productAndProfessional });
      });
    }
  });
});

// Create a Product

Router.post('/', function (req, res, next) {
  // Check owner
  if ( req.body.professional != req.decoded.user._id ) {
    return res.status(403).json({ ok: false, message: res.__('forbidden_access') });
  }

  Product.createRecord(req.body, function (err) {
    if (err) return next(err);

    // Product created
    return res.json({ ok: true, message: res.__('product_created') });
  });
});

// Remove a product by owner and not deleted

Router.delete('/:id', function (req, res, next) {
  Product.findOneAndUpdate({ _id: req.params.id, professional: req.decoded.user._id, deleted: false }, { deleted: true }, function (err, product) {
    if (err) return next(err);

    if (!product) {
      return res.json({
        ok: false, error: {
          code: 401,
          message: res.__('product_not_found')
        }
      });
    } else if (product) {
      return res.json({ ok: true, message: res.__('product_deleted')});
    }
  });
});

// Update a product by owner and not deleted

Router.put('/:id', function (req, res, next) {

  if ( (req.params.id != req.decoded.user._id) ) {
    return res.status(403).json({ ok: false, message: res.__('forbidden_access') });
  }

  if ( (req.body.id != null) && (req.body.id != req.params.id) ) {
    return res.status(422).json({ ok: false, message: res.__('product_information_error') });
  }

  Product.findOneAndUpdate({ _id: req.params.id, professional: req.decoded.user._id,  deleted: false }, req.body, function (err, product) {
    if (err) return next(err);

    if (!product) {
      return res.json({
        ok: false, error: {
          code: 401,
          message: res.__('product_not_found')
        }
      });
    } else if (product) {
      return res.json({ ok: true, message: res.__('product_updated') });
    }
  });

});

module.exports = Router;
