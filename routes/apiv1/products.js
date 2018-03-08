'use strict';

let express = require('express');
let Router = express.Router();
let mongoose = require('mongoose');
let Product = mongoose.model('Product');

// Auth con JWT
let jwtAuth = require('../../lib/jwtAuth');
Router.use(jwtAuth());

// Get all products

Router.get('/', (req, res, next) => {

  let start = parseInt(req.query.start) || 0;
  let limit = parseInt(req.query.limit) || 1000; // Our API returns max 1000 registers
  let sort = req.query.sort || '_id';
  let includeTotal = req.query.includeTotal === 'true';
  let filters = {};

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

// Get a product

Router.get('/:id', (req, res, next) => {

  // Find product
  Product.findById(req.params.id).exec(function (err, product) {
    if (err) return next(err);

    if (!product) {
      return res.json({
        ok: false, error: {
          code: 401,
          message: res.__('product_not_found')
        }
      });
    } else if (product) {
      res.json({ ok: true, result: product})
    }
  });
});

// Create a product

Router.post('/', function (req, res, next) {
  Product.createRecord(req.body, function (err) {
    if (err) return next(err);

    // product created
    return res.json({ ok: true, message: res.__('product_created') });
  });
});

// Remove a product

Router.delete('/:idProduct', function (req, res, next) {
  Product.findOne({ idProduct: req.params.idProduct }, function (err, product) {
    if (err) return next(err);

    if (!product) {
      return res.json({
        ok: false, error: {
          code: 401,
          message: res.__('product_not_found')
        }
      });
    } else if (product) {
      Product.deleteOne({idProduct: req.params.idProduct}, function (err){
        if (err) return next(err);

        return res.json({ ok: true, message: res.__('product_deleted' )});
      })
    }
  });
});

// Update a product

Router.put('/:idProduct', function (req, res, next) {

  Product.findOne({ idProduct: req.params.idProduct }, function (err, product) {
    if (err) return next(err);

    if (!product) {
      return res.json({
        ok: false, error: {
          code: 401,
          message: res.__('product_not_found')
        }
      });
    } else if (product) {

      Product.updateOne(req.body, function (err) {
        if (err) return next(err);
    
        // product updated
        return res.json({ ok: true, message: res.__('product_updated') });
      });
    }
  });

});

module.exports = Router;
