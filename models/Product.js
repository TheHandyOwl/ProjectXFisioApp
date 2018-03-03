'use strict';

const mongoose = require('mongoose');
const hash = require('hash.js');
const v = require('validator');

const fs = require('fs');
const flow = require('../lib/flowControl');

const productSchema = mongoose.Schema({
  
  idProduct   : { type: Number, index : true },
  name        : { type: String, index: true, lowercase: true, required: true },
  description : { type: String, index:true, lowercase:true, required: true },
  price       : { type: Number, index:true, unique: false, required: true },

});

/**
 * Load json - products
 */
productSchema.statics.loadJson = async function (file) {

  const data = await new Promise((resolve, reject) => {
    fs.readFile(file, { encoding: 'utf8' }, (err, data) => {
      return err ? reject(err) : resolve(data);
    });
  });

  console.log(file + ' read.');

  if (!data) {
    throw new Error(file + ' is empty!');
  }

  const products = JSON.parse(data).products;
  const numProducts = products.length;

  for (var i = 0; i < products.length; i++) {
    await (new Product(products[i])).save();
  }

  return numProducts;

};

productSchema.statics.exists = function (idProduct, cb) {
  Product.findById(idProduct, function (err, product) {
    if (err) return cb(err);
    return cb(null, product ? true : false);
  });
};

productSchema.statics.list = function (startRow, numRows, sortField, includeTotal, filters, cb) {

  const query = Product.find(filters);

  query.sort(sortField);
  query.skip(startRow);
  query.limit(numRows);

  return query.exec(function (err, rows) {
    if (err) return cb(err);

    // System logo for a date in an appointment
    rows.forEach((row) => {
      //row.foto = configApp.appURLBasePath + configApp.imageLogoDate;
    });

    const result = { rows };

    if (!includeTotal) return cb(null, result);

    // incluir propiedad total
    Service.count({}, (err, total) => {
      if (err) return cb(err);
      result.total = total;
      return cb(null, result);
    });
  });
};

productSchema.statics.createRecord = function (product, cb) {
  // Validations
  const valErrors = [];
  if (!(v.isAlpha(product.name) && v.isLength(product.name, 2))) {
    valErrors.push({ field: 'name', message: __('validation_invalid', { field: 'name' }) });
  }

  if (valErrors.length > 0) {
    return cb({ code: 422, errors: valErrors });
  }

  // Check duplicates
  // Search product
  Product.findOne({ name: product.name }, function (err, exists) {
    if (err) {
      return cb(err);
    }

    // Service already exists
    if (exists) {
      return cb({ code: 409, message: __('product_name_duplicated') });
    } else {

      // Add new service
      new Product(product).save(cb);
    }
  });
};

var Product = mongoose.model('Product', productSchema);
