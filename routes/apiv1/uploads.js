var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var User = require('../../models/User');
var Blog = require('../../models/Blog');
var Product = require('../../models/Product');

// default options
app.use(fileUpload());

// app.get('/image/:type/:id', (req, res, next) => {
app.put('/:type/:id', (req, res, next) => {

    console.log(req);
    var type = req.params.type;
    var id = req.params.id;

    // types accepted
    var validTypes = ['products', 'blogs', 'users'];
    if (validTypes.indexOf(type) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'El tipo de la coleccion no es válida',
            errors: { message: 'tipo de colección no es válida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una image' }
        });
    }

    // Get name random file
    var file = req.files.image;
    var fileShorted = file.name.split('.');
    var fileExtension = fileShorted[fileShorted.length - 1];

    // Files accepted
    var validExtensions = ['png', 'jpg', 'gif', 'jpeg'];

    if (validExtensions.indexOf(fileExtension) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Extension no válida',
            errors: { message: 'Las extensiones válidas son ' + validExtensions.join(', ') }
        });
    }

    // Custom file name
    // 12312312312-123.png
    var fileName = `${ id }-${ new Date().getMilliseconds() }.${ fileExtension }`;

    // Move file to temporal path
    var path = `../../uploads/${ type }/${ fileName }`;

    file.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al mover el archivo',
                errors: err
            });
        }

        uploadByType(type, id, fileName, res);

    });

});

function uploadByType(type, id, fileName, res) {

    if (type === 'users') {

        User.findById(id, (err, User) => {

            if (!User) {
                return res.status(400).json({
                    ok: true,
                    message: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }

            var oldPath = '../../uploads/users/' + User.img;

            // If image exists is replaced
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath);
            }

            User.img = fileName;

            User.save((err, updatedUser) => {

                updatedUser.password = ':)';

                return res.status(200).json({
                    ok: true,
                    message: 'Imagen del usuario ha sido actualizada',
                    User: updatedUser
                });

            });

        });

    }

    if (type === 'blogs') {

        Blog.findById(id, (err, blog) => {

            if (!blog) {
                return res.status(400).json({
                    ok: true,
                    message: 'Blog no existe',
                    errors: { message: 'Blog no existe' }
                });
            }

            var oldPath = '../../uploads/blogs/' + blog.img;

            // Si existe, elimina la image anterior
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath);
            }

            blog.img = fileName;

            blog.save((err, updatedBlog) => {

                return res.status(200).json({
                    ok: true,
                    message: 'Image de blog actualizada',
                    blog: updatedBlog
                });

            });

        });
    }

    if (type === 'products') {

        Product.findById(id, (err, product) => {

            if (!product) {
                return res.status(400).json({
                    ok: true,
                    message: 'producto no existe',
                    errors: { message: 'producto no existe' }
                });
            }

            var oldPath = '../../uploads/products/' + product.img;

            // Si existe, elimina la image anterior
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath);
            }

            product.img = fileName;

            product.save((err, updatedProduct) => {

                return res.status(200).json({
                    ok: true,
                    message: 'Image de producto actualizada',
                    product: updatedProduct
                });

            });

        });
    }

}

module.exports = app;