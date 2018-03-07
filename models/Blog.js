'use strict';

const mongoose = require('mongoose');
let Schema = mongoose.Schema;
let User = mongoose.model('User');

const hash = require('hash.js');
const v = require('validator');

const fs = require('fs');
const flow = require('../lib/flowControl');

const postSchema = mongoose.Schema({
  
  professional    : { type: mongoose.Schema.ObjectId, ref: User },
  customer        : { type: mongoose.Schema.ObjectId, ref: User },
  name            : { type: String, index: true, lowercase: true, required: true },
  description     : { type: String, index:true, lowercase:true, required: true },
  isVisible       : Boolean,
  creationDate    : Date,
  publicationDate : Date

});

postSchema.statics.exists = function (idBlog, cb) {
  Blog.findById(idBlog, function (err, post) {
    if (err) return cb(err);
    return cb(null, post ? true : false);
  });
};

/**
 * Load json - posts
 */
postSchema.statics.loadJson = async function (file) {

  const data = await new Promise((resolve, reject) => {
    fs.readFile(file, { encoding: 'utf8' }, (err, data) => {
      return err ? reject(err) : resolve(data);
    });
  });

  console.log(file + ' read.');

  if (!data) {
    throw new Error(file + ' is empty!');
  }

  const posts = JSON.parse(data).posts;
  const numPosts = posts.length;

  for (var i = 0; i < posts.length; i++) {
    await (new Blog(posts[i])).save();
  }

  return numPosts;

};

postSchema.statics.createRecord = function (post, cb) {
  // Validations
  const valErrors = [];
  if (!(v.isAlpha(post.name) && v.isLength(post.name, 2))) {
    valErrors.push({ field: 'name', message: __('validation_invalid', { field: 'name' }) });
  }

  if (valErrors.length > 0) {
    return cb({ code: 422, errors: valErrors });
  }

  // Check duplicates
  // Search post
  Blog.findOne({ name: post.name.toLowerCase() }, function (err, exists) {
    if (err) {
      return cb(err);
    }

    // post already exists
    if (exists) {
      return cb({ code: 409, message: __('post_name_duplicated') });
    } else {

      // Add new post
      new Blog(post).save(cb);
    }
  });
};

var Blog = mongoose.model('Blog', postSchema);
