"use strict";

const express = require("express");
const Router = express.Router();

const Mongoose = require("mongoose");
const User = Mongoose.model("User");

const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const hash = require("hash.js");

// User authentication for known users

Router.post("/", function(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    const deleted = false;

    // Search user
    User.findOne({ email, deleted }, function(err, user) {
        if (err) return next(err);

        if (!user) {
            return res.status(404).json({
                ok: false,
                error: {
                    code: 404,
                    message: res.__("users_user_not_found")
                }
            });
        } else if (user) {
            // Hash password and compare
            const passwordHash = hash
                .sha256()
                .update(password)
                .digest("hex");

            // It's the same password?
            if (user.password != passwordHash) {
                return res.status(401).json({
                    ok: false,
                    error: {
                        code: 401,
                        message: res.__("users_wrong_password")
                    }
                });
            } else {
                // User found and same password
                // Make token
                const token = jwt.sign({ user }, config.jwt.secret, config.jwt.options);

                // return the information including token as JSON

                user.password = "🤔 👻 😜";
                console.log("Menu para:");
                console.log(user.role);
                console.log(getMenu(user.isProfessional));

                return res.status(200).json({
                    ok: true,
                    token: token,
                    user: user,
                    id: user._id,
                    menu: getMenu(user)
                });
            }
        }
    });
});

function getMenu(user) {
    var menu = [{
            title: "Main",
            icon: "mdi mdi-gauge",
            submenu: [{ title: "Dashboar", url: "/dashboard" }]
        },
        {
            title: "Servicios para el usuario",
            icon: "mdi mdi-folder-lock-open",
            submenu: [
                // { title: 'Usuarios', url: '/users' },
                { title: "Productos", url: "/products" },
                { title: "Servicios", url: "/services" },
                { title: "Blogs", url: "/blogs" },
                { title: "Citas", url: "/appointments" }
            ]
        }
    ];

    if (user.isProfessional) {
        menu[1].submenu.unshift({ title: "Usuarios", url: "/users" });
    }

    return menu;
}
module.exports = Router;