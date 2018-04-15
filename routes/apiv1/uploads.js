var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

const Mongoose = require("mongoose");

const path = require("path");

var app = express();

const User = Mongoose.model("User");
const Product = Mongoose.model("Product");
const Blog = Mongoose.model("Blog");

// default options
app.use(fileUpload());

app.put('/:type/:id', (req, res, next) => {

    var type = req.params.type;
    var id = req.params.id;

    // types de colección
    var validTypes = ['blogs', 'products', 'users'];
    if (validTypes.indexOf(type) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'type de colección no es válida',
            errors: { message: 'type de colección no es válida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una image' }
        });
    }

    // Obtener nombre del file
    var file = req.files.image;
    var fileShorted = file.name.split('.');
    var fileExtension = fileShorted[fileShorted.length - 1];

    // Sólo estas extensiones aceptamos
    var validExtensions = ['png', 'jpg', 'gif', 'jpeg'];

    if (validExtensions.indexOf(fileExtension) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Extension no válida',
            errors: { message: 'Las extensiones válidas son ' + validExtensions.join(', ') }
        });
    }

    // Nombre de file personalizado
    // 12312312312-123.png
    var fileName = `${ id }-${ new Date().getMilliseconds() }.${ fileExtension }`;

    // Mover el file del temporal a un path
    var updatePath = path.resolve(__dirname, `../../uploads/${ type }/${ fileName }`);

    file.mv(updatePath, err => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                ok: false,
                message: 'Error al mover file',
                errors: err
            });
        }

        uploadByType(type, id, fileName, res);

    });

});

function uploadByType(type, id, fileName, res) {

    if (type === 'users') {

        User.findById(id, (err, user) => {

            if (!user) {
                return res.status(400).json({
                    ok: true,
                    message: 'User no existe',
                    errors: { message: 'User no existe' }
                });
            }

            console.log(user);
            var oldPath = path.resolve(__dirname, `../../uploads/users/${ user.img }`);

            // Si existe, elimina la image anterior
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath);
            }

            user.img = fileName;

            user.save((err, updatedUser) => {

                updatedUser.password = ':)';

                return res.status(200).json({
                    ok: true,
                    message: 'Image de User actualizada',
                    User: updatedUser
                });

            });

        });

    }

    if (type === 'products') {

        Product.findById(id, (err, product) => {

            if (!product) {
                return res.status(400).json({
                    ok: true,
                    message: 'El producto no existe',
                    errors: { message: 'El producto no existe' }
                });
            }

            var oldPath = path.resolve(__dirname, `../../uploads/products/${ user.image }`);


            // Si existe, elimina la image anterior
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath);
            }

            product.img = fileName;

            product.save((err, updatedProduct) => {

                return res.status(200).json({
                    ok: true,
                    message: 'Image de médico actualizada',
                    product: updatedProduct
                });

            });

        });
    }

    if (type === 'blogs') {

        Blog.findById(id, (err, blog) => {

            if (!blog) {
                return res.status(400).json({
                    ok: true,
                    message: 'Blogs no existe',
                    errors: { message: 'Blogs no existe' }
                });
            }

            var oldPath = path.resolve(__dirname, `../../uploads/blogs/${ user.image }`);

            // Si existe, elimina la image anterior
            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath);
            }

            blog.img = fileName;

            blog.save((err, updatedBlog) => {

                return res.status(200).json({
                    ok: true,
                    message: 'Image de Blogs actualizada',
                    blog: updatedBlog
                });

            });

        });
    }

}

module.exports = app;