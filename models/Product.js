'use strict';

const mongoose = require('mongoose');
const User = mongoose.model('User');

const hash = require('hash.js');
const validator = require('validator');

const fs = require('fs');
const flow = require('../lib/flowControl');

const configDBProductsFields = require('./../config/config').db.products;
const configDBUsersFields = require('./../config/config').db.users;

const productSchema = mongoose.Schema({
  
  professional  : { type: mongoose.Schema.ObjectId, ref: User, required: true },
  name          : { type: String, lowercase: true, required: true },
  description   : { type: String, lowercase: true, required: true },
  price         : { type: Number, required: true },
  isActive      : { type: Boolean, required: true, default: false },

  deleted       : { type: Boolean, default: false }

});

// Indexes
productSchema.index( { professional: 1 } );
productSchema.index( { name: 1 } );
productSchema.index( { price: 1 } );
productSchema.index( { isActive: 1 } );
productSchema.index( { deleted: 1 } );

/**
 * Load json - products
 */
productSchema.statics.loadJson = async function (file) {

  const data = await new Promise((resolve, reject) => {
    fs.readFile(file, { encoding: 'utf8' }, (err, data) => {
      return err ? reject(err) : resolve(data);
    });
  });

  console.log(file + ' readed.');

  if (!data) {
    throw new Error(file + ' is empty!');
  }

  const products = JSON.parse(data).products;
  const numProducts = products.length;

  for (let i = 0; i < products.length; i++) {
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

  const query = Product
    .find(filters)
    .select( configDBProductsFields.productsListPublicFields || '_id' );

  query.sort(sortField);
  query.skip(startRow);
  query.limit(numRows);

  return query.exec(function (err, rows) {
    if (err) return cb(err);

    // System logo for a date in an appointment
    rows.forEach((row) => {
      //row.foto = configApp.appURLBasePath + configApp.imageLogoDate;
    });

    // Populate
    User.populate( rows,
      { path: 'professional', select: configDBUsersFields.userPublicFields || '_id' },
      function(err, productAndProfessional) {
      let result = { rows: productAndProfessional };

      if (!includeTotal) return cb(null, result);

      // Includes total property
      Service.count({}, (err, total) => {
        if (err) return cb(err);
        result.total = total;
        return cb(null, result);
      });

    });

  });
};

productSchema.statics.createRecord = function (product, cb) {
  // Validations
  let valErrors = [];
  if (!(validator.isAlphanumeric(validator.blacklist(product.name, ' ')) && validator.isLength(product.name, 2))) {
    valErrors.push({ field: 'name', message: __('validation_invalid', { field: 'name' }) });
  }

  if (!(validator.isAlphanumeric(validator.blacklist(product.description, ' ')) && validator.isLength(product.description, 2))) {
    valErrors.push({ field: 'description', message: __('validation_invalid', { field: 'description' }) });
  }

  if (!(validator.isHexadecimal(product.professional))) {
    valErrors.push({ field: 'professional', message: __('validation_invalid', { field: 'professional' }) });
  }

  if (valErrors.length > 0) {
    return cb({ code: 422, errors: valErrors });
  }

  // Check duplicates
  // Search product
  Product.findOne({ professional: product.professional, name: product.name.toLowerCase() }, function (err, exists) {
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

let Product = mongoose.model('Product', productSchema);
